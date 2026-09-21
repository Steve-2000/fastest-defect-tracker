import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";
import { mockDb } from "../mock/mockData";

interface ProjectInfo {
  projectId: number;
  projectName: string;
  role: string;
}

interface PermissionContextType {
  can: any;
  hasPermission: (type: string, action?: string) => boolean;
  hasAnyPermission: (permList: string[]) => boolean;
  allPermissions: string[];
  isLoading: boolean;
  permissionsReady: boolean;
  projects: ProjectInfo[];
  selectedProjectId: number | null;
  switchProject: (projectId: number | null) => Promise<void>;
  refreshPermissions: () => Promise<void>;
  isAdmin: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) throw new Error("usePermission must be used within PermissionProvider");
  return context;
};

// Module name normalization mapping
const MODULE_NAME_MAP: Record<string, string> = {
  designation: "Designation",
  role: "Role",
  permission: "Permission",
  rolepermission: "RolePermission",
  employeepermission: "EmployeePermission",
  moduleallocation: "ModuleAllocation",
  submoduleallocation: "SubModuleAllocation",
  testcaseallocation: "TestCaseAllocation",
  projectallocation: "ProjectAllocation",
  employee: "Employee",
  bench: "Bench",
  project: "Project",
  module: "Module",
  submodule: "SubModule",
  testcase: "TestCase",
  defect: "Defect",
  release: "Release",
  defecttype: "DefectType",
  releasetype: "ReleaseType",
  severity: "Severity",
  priority: "Priority",
  statustype: "StatusType",
  workflow: "StatusWorkflow",
  statusworkflow: "StatusWorkflow",
  emailconfig: "EmailConfig",
  emailtemplate: "EmailTemplate",
  pointsetup: "EmailConfig",
  roleemailrecipient: "RoleEmailRecipient",
  employeeemailrecipient: "EmployeeEmailRecipient",
};

// Action name normalization mapping
const ACTION_NAME_MAP: Record<string, string> = {
  view: "READ",
  read: "READ",
  get: "READ",
  create: "CREATE",
  add: "CREATE",
  edit: "UPDATE",
  update: "UPDATE",
  delete: "DELETE",
  remove: "DELETE",
  assign: "ASSIGN",
  deallocate: "DEALLOCATE",
  access: "ACCESS",
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [permissions, setPermissions] = useState<string[]>(() => {
    if (user && Array.isArray((user as any).globalPermissions)) {
      return (user as any).globalPermissions;
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [permissionsReady, setPermissionsReady] = useState(false);
  const [projects, setProjects] = useState<ProjectInfo[]>([]);

  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    const roles: string[] = (user as any).roles || [];
    return (
      roles.some(r => r.toUpperCase().includes("SUPER ADMIN") || r.toUpperCase() === "SUPER_ADMIN" || r.toUpperCase() === "ADMIN") ||
      (user as any).roleId === 1 ||
      (user as any).id === 1
    );
  }, [user]);

  const fetchUserPermissions = useCallback(async () => {
    if (!user) {
      setPermissions([]);
      setPermissionsReady(true);
      return;
    }

    try {
      setIsLoading(true);
      const res = await apiClient.get(ENDPOINTS.currentUserPermissions);
      const fetched: string[] = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setPermissions(fetched);
    } catch (err) {
      console.warn("Could not fetch user permissions, falling back to cached permissions", err);
    } finally {
      setIsLoading(false);
      setPermissionsReady(true);
    }
  }, [user]);

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(() => {
    const saved = localStorage.getItem("selectedProjectId");
    return saved ? parseInt(saved) : null;
  });

  const [projectPermissions, setProjectPermissions] = useState<string[]>([]);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      return [];
    }
    try {
      const res = await apiClient.get(ENDPOINTS.currentUserProjects);
      const rawList = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      const projectList: ProjectInfo[] = rawList.map((p: any) => ({
        projectId: Number(p.id || p.projectId),
        projectName: p.name || p.projectName || "Project",
        role: p.manager?.id === (user as any).id ? "Project Manager" : (p.roleName || "Member"),
      }));
      setProjects(projectList);

      setSelectedProjectId(prev => {
        if (projectList.length === 0) {
          localStorage.removeItem("selectedProjectId");
          return null;
        }
        if (prev != null && projectList.some(p => p.projectId === prev)) {
          return prev;
        }
        const defaultId = projectList[0].projectId;
        localStorage.setItem("selectedProjectId", String(defaultId));
        return defaultId;
      });

      return projectList;
    } catch (err) {
      console.warn("Could not fetch user projects", err);
      return [];
    }
  }, [user]);

  const fetchProjectPermissions = useCallback(async (projId: number | null) => {
    if (!user || !projId) {
      setProjectPermissions([]);
      return;
    }
    try {
      const res = await apiClient.get(ENDPOINTS.currentUserProjectPermissions(projId));
      const fetched: string[] = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setProjectPermissions(fetched);
    } catch (err) {
      console.warn(`Could not fetch permissions for project ${projId}`, err);
      setProjectPermissions([]);
    }
  }, [user]);

  const switchProject = useCallback(
    async (projectId: number | null) => {
      if (projectId) {
        localStorage.setItem("selectedProjectId", String(projectId));
      } else {
        localStorage.removeItem("selectedProjectId");
      }
      setSelectedProjectId(projectId);
    },
    []
  );

  const refreshPermissions = async () => {
    await Promise.all([
      fetchUserPermissions(),
      fetchProjects(),
      selectedProjectId ? fetchProjectPermissions(selectedProjectId) : Promise.resolve(),
    ]);
  };

  useEffect(() => {
    fetchUserPermissions();
    fetchProjects();
  }, [fetchUserPermissions, fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectPermissions(selectedProjectId);
    } else {
      setProjectPermissions([]);
    }
  }, [selectedProjectId, fetchProjectPermissions]);

  const combinedAllPermissions = useMemo(() => {
    const set = new Set<string>();
    permissions.forEach(p => set.add(p));
    projectPermissions.forEach(p => set.add(p));
    return Array.from(set);
  }, [permissions, projectPermissions]);

  const normalizedPermissionSet = useMemo(() => {
    const combined = new Set<string>();
    permissions.forEach(p => combined.add(p.toUpperCase()));
    projectPermissions.forEach(p => combined.add(p.toUpperCase()));
    return combined;
  }, [permissions, projectPermissions]);

  const hasPermission = useCallback((type: string, action?: string): boolean => {
    if (!user) return false;
    if (isSuperAdmin || normalizedPermissionSet.has("ALL_PERMISSIONS")) return true;

    if (!type) return false;

    if (action) {
      const normModule = MODULE_NAME_MAP[type.toLowerCase()] || type;
      const normAction = ACTION_NAME_MAP[action.toLowerCase()] || action;
      const key = `${normModule.toUpperCase()}:${normAction.toUpperCase()}`;
      return normalizedPermissionSet.has(key);
    }

    // Single argument passed (e.g. "Designation:READ" or "Designation")
    const upper = type.toUpperCase();
    if (upper.includes(":")) {
      return normalizedPermissionSet.has(upper);
    }

    // Check if user has ANY action for this module
    for (const p of normalizedPermissionSet) {
      if (p.startsWith(`${upper}:`)) {
        return true;
      }
    }
    return normalizedPermissionSet.has(upper);
  }, [user, isSuperAdmin, normalizedPermissionSet]);

  const hasAnyPermission = useCallback((permList: string[]): boolean => {
    if (!user) return false;
    if (isSuperAdmin || normalizedPermissionSet.has("ALL_PERMISSIONS")) return true;
    return permList.some(p => hasPermission(p));
  }, [user, isSuperAdmin, normalizedPermissionSet, hasPermission]);

  // Dynamic proxy that transparently evaluates can.[module].[action]
  const dynamicCanProxy = useMemo(() => {
    return new Proxy({}, {
      get: (_target, moduleProp: string) => {
        return new Proxy({}, {
          get: (_moduleTarget, actionProp: string) => {
            return hasPermission(moduleProp, actionProp);
          }
        });
      }
    });
  }, [hasPermission]);

  return (
    <PermissionContext.Provider
      value={{
        can: dynamicCanProxy,
        hasPermission,
        hasAnyPermission,
        allPermissions: combinedAllPermissions,
        isLoading,
        permissionsReady,
        projects,
        selectedProjectId,
        switchProject,
        refreshPermissions,
        isAdmin: isSuperAdmin,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};