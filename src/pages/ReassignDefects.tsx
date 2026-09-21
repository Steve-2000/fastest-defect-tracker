import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Checkbox } from '../components/ui/Checkbox';
import { getAllSubmoduleAllocatedDevBySubmoduleId } from '../api/subModuleDevAlloc';
import { usePermission } from '../context/PermissionContext';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { getDefectsByProjectId } from '../api/defect/filterDefectByProject';
import { getModulesByProjectId } from '../api/module/getModule';
import { getSubmodulesByModuleId } from '../api/submodule/submoduleget';

interface Defect {
  id: number;
  defectId: string;
  description: string;
  assigned_to_name: string;
  assigned_to_id: number | null;
  module_name: string;
  sub_module_name: string;
  subModuleId?: number;
  moduleId?: number;
  defect_status_name: string;
  [key: string]: any;
}

interface ReassignDefectsProps {
  defects: Defect[];
  projectId: string;
  onReassign: (defectIds: number[], assignedToId: number) => Promise<void>;
  onClose: () => void;
  className?: string;
  onSuccess?: () => void;
}

interface SubmoduleItem {
  id: number;
  name: string;
  moduleId: number;
  moduleName: string;
}

interface ModuleItem {
  id: number;
  name: string;
}

interface AllocatedDeveloper {
  userId: number;
  userName: string;
  empId: number;
}

const INACTIVE_STATUSES = ['CLOSED', 'FIXED'];

export const ReassignDefects: React.FC<ReassignDefectsProps> = ({
  defects,
  projectId,
  onReassign,
  onClose,
  className = '',
  onSuccess,
}) => {
  // ─── Filter States ─────────────────────────────────────────────────────────────
  // 1. Filter by Assigned Dev (optional)
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  // 2. Filter by Module (optional)
  const [filterModule, setFilterModule] = useState<string>('');
  // 3. Filter by Submodule (mandatory before reassignment)
  const [filterSubmodule, setFilterSubmodule] = useState<string>('');
  // 4. Reassign To developer (mandatory selection)
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');

  // ─── Data & Selection States ───────────────────────────────────────────────────
  const [selectedDefects, setSelectedDefects] = useState<Set<number>>(new Set());
  const [allProjectDefects, setAllProjectDefects] = useState<Defect[]>([]);
  const [isLoadingDefects, setIsLoadingDefects] = useState(false);

  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [allSubmodules, setAllSubmodules] = useState<SubmoduleItem[]>([]);
  const [submoduleAllocations, setSubmoduleAllocations] = useState<Record<number, AllocatedDeveloper[]>>({});
  const [allocationsLoading, setAllocationsLoading] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // ─── Pagination ────────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [defectsPerPage, setDefectsPerPage] = useState(10);

  // ─── Confirmation Modal ───────────────────────────────────────────────────────
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [pendingReassignData, setPendingReassignData] = useState<{
    defectIds: number[];
    assigneeId: number;
  } | null>(null);

  const { can } = usePermission();

  // ─── 1. Load Modules & Submodules for Current Project ──────────────────────────
  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;
    getModulesByProjectId(Number(projectId))
      .then(async (modList) => {
        if (!isMounted) return;
        const mArray = Array.isArray(modList) ? modList : modList?.data || [];
        const mappedModules: ModuleItem[] = mArray
          .map((m: any) => ({
            id: Number(m.id || m.moduleId),
            name: m.name || m.moduleName || `Module ${m.id}`,
          }))
          .filter((m: ModuleItem) => m.id && m.name);

        setModules(mappedModules);

        // Fetch submodules for each module in parallel
        const subResults = await Promise.all(
          mappedModules.map(async (mod) => {
            try {
              const res = await getSubmodulesByModuleId(mod.id);
              const subList = res?.data || res?.content || (Array.isArray(res) ? res : []);
              return subList.map((sm: any) => ({
                id: Number(sm.id || sm.subModuleId),
                name: sm.name || sm.subModuleName || `Submodule ${sm.id}`,
                moduleId: mod.id,
                moduleName: mod.name,
              }));
            } catch (err) {
              console.error(`Error loading submodules for module ${mod.id}:`, err);
              return [];
            }
          })
        );

        if (!isMounted) return;
        const flattenedSubmodules: SubmoduleItem[] = subResults.flat().filter((sm: SubmoduleItem) => sm.id && sm.name);
        setAllSubmodules(flattenedSubmodules);

        // Preload allocations for all discovered submodules
        setAllocationsLoading(true);
        const allocPairs = await Promise.all(
          flattenedSubmodules.map(async (sm) => {
            try {
              const rawAlloc = await getAllSubmoduleAllocatedDevBySubmoduleId(sm.id);
              const devList = Array.isArray(rawAlloc) ? rawAlloc : rawAlloc?.data || [];
              const mappedDevs: AllocatedDeveloper[] = devList
                .map((d: any) => ({
                  userId: Number(d.employeeId || d.userId || d.id),
                  userName: d.employeeName || d.userName || d.name || `Developer ${d.employeeId || d.userId || d.id}`,
                  empId: Number(d.employeeId || d.userId || d.id),
                }))
                .filter((d: AllocatedDeveloper) => d.userId && d.userName);
              return { subModuleId: sm.id, devs: mappedDevs };
            } catch {
              return { subModuleId: sm.id, devs: [] };
            }
          })
        );

        if (!isMounted) return;
        const allocMap: Record<number, AllocatedDeveloper[]> = {};
        allocPairs.forEach((pair) => {
          allocMap[pair.subModuleId] = pair.devs;
        });
        setSubmoduleAllocations(allocMap);
        setAllocationsLoading(false);
      })
      .catch((err) => {
        console.error('Error initializing modules and submodules:', err);
        if (isMounted) setAllocationsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // ─── 2. Fetch Active Defects for Current Project ──────────────────────────────
  const fetchAllDefects = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingDefects(true);
    setError(null);
    try {
      const responseData = await getDefectsByProjectId(Number(projectId));
      const rawList =
        responseData?.content ||
        responseData?.data?.content ||
        responseData?.data ||
        (Array.isArray(responseData) ? responseData : []);

      const mapped: Defect[] = rawList.map((d: any) => ({
        id: Number(d.id),
        defectId: d.defectId || (d.defectNo ? d.defectNo : `DEF-${d.id.toString().padStart(3, '0')}`),
        defect_status_name: d.statusName || d.defectStatusName || d.status || '',
        description: d.description || d.defectDescription || '',
        steps: d.stepsToRecreation || d.steps || '',
        type_name: d.defectTypeName || d.type || '',
        severity_name: d.severityName || d.defectSeverityName || d.severity || '',
        projectName: d.projectName || '',
        project_name: d.projectName || '',
        name: d.priorityName || d.priority || '',
        assigned_to_name: d.assignedToName || (d.assignedTo ? d.assignedTo.name : ''),
        assigned_by_name: d.createdByName || (d.reportedBy ? d.reportedBy.name : ''),
        assigned_to_id: d.assignedToId ?? (d.assignedTo ? d.assignedTo.id : null),
        assigned_by_id: d.assignedById ?? (d.reportedBy ? d.reportedBy.id : null),
        subModuleId: d.subModuleId ?? (d.subModule ? d.subModule.id : undefined),
        sub_module_name: d.subModuleName || (d.subModule ? d.subModule.name : ''),
        moduleId:
          d.moduleId ??
          (d.module ? d.module.id : d.subModule && d.subModule.module ? d.subModule.module.id : undefined),
        module_name:
          d.moduleName ||
          (d.module ? d.module.name : d.subModule && d.subModule.module ? d.subModule.module.name : ''),
      }));

      setAllProjectDefects(mapped);
    } catch (err: any) {
      console.error('Failed to load project defects:', err);
      setError('Failed to load project defects');
    } finally {
      setIsLoadingDefects(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAllDefects();
  }, [fetchAllDefects]);

  // Active defects (exclude CLOSED, FIXED)
  const activeDefects = useMemo(() => {
    const list = allProjectDefects.length > 0 ? allProjectDefects : defects || [];
    return list.filter((defect) => {
      const status = (defect.defect_status_name || '').toUpperCase();
      return !INACTIVE_STATUSES.includes(status);
    });
  }, [allProjectDefects, defects]);

  // ─── 3. Filter Options: Assigned Developer (All assigned devs) ────────────────
  const assignedDevOptions = useMemo(() => {
    const map = new Map<string, string>();
    activeDefects.forEach((d) => {
      if (d.assigned_to_id) {
        const key = String(d.assigned_to_id);
        const label = d.assigned_to_name || `Developer ${key}`;
        if (!map.has(key)) {
          map.set(key, label);
        }
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [activeDefects]);

  // ─── 4. Dynamic Module Options (Narrowed by Assigned Dev if selected) ─────────
  const availableModuleOptions = useMemo(() => {
    if (!filterAssignee) {
      return modules;
    }
    // Modules relevant to selected developer's defects
    const relevantModuleIds = new Set<number>();
    activeDefects.forEach((d) => {
      if (String(d.assigned_to_id) === filterAssignee) {
        if (d.moduleId) relevantModuleIds.add(Number(d.moduleId));
      }
    });
    return modules.filter((m) => relevantModuleIds.has(m.id));
  }, [modules, filterAssignee, activeDefects]);

  // ─── 5. Dynamic Submodule Options ─────────────────────────────────────────────
  // Rule 3 & 4:
  // - If Module is selected: only submodules belonging to that module.
  // - If Assigned Dev is selected: only submodules relevant to that developer.
  // - Combined: satisfy both.
  // - If Module is "All": show all submodules across all modules.
  const availableSubmoduleOptions = useMemo(() => {
    let result = allSubmodules;

    // Narrow by Module if selected
    if (filterModule) {
      const modId = Number(filterModule);
      result = result.filter((sm) => sm.moduleId === modId);
    }

    // Narrow by Assigned Dev if selected
    if (filterAssignee) {
      const devSubmoduleIds = new Set<number>();
      activeDefects.forEach((d) => {
        if (String(d.assigned_to_id) === filterAssignee) {
          if (d.subModuleId) devSubmoduleIds.add(Number(d.subModuleId));
        }
      });
      result = result.filter((sm) => devSubmoduleIds.has(sm.id));
    }

    return result;
  }, [allSubmodules, filterModule, filterAssignee, activeDefects]);

  // ─── 6. Reset Dependencies On Filter Changes (Rule 16) ────────────────────────
  // When availableModuleOptions change, if current filterModule is invalid, reset it
  useEffect(() => {
    if (filterModule && !availableModuleOptions.some((m) => String(m.id) === filterModule)) {
      setFilterModule('');
    }
  }, [availableModuleOptions, filterModule]);

  // When availableSubmoduleOptions change, if current filterSubmodule is invalid, reset it
  useEffect(() => {
    if (filterSubmodule && !availableSubmoduleOptions.some((sm) => String(sm.id) === filterSubmodule)) {
      setFilterSubmodule('');
      setSelectedAssignee('');
      setSelectedDefects(new Set());
    }
  }, [availableSubmoduleOptions, filterSubmodule]);

  // When Submodule is cleared, reset Reassign To and selected developer
  const handleSubmoduleChange = (newSubmoduleId: string) => {
    setFilterSubmodule(newSubmoduleId);
    setSelectedAssignee('');
    setSelectedDefects(new Set());
    setError(null);

    // If a submodule is picked and its allocations are not yet cached, fetch them
    if (newSubmoduleId && !submoduleAllocations[Number(newSubmoduleId)]) {
      setAllocationsLoading(true);
      getAllSubmoduleAllocatedDevBySubmoduleId(Number(newSubmoduleId))
        .then((rawAlloc) => {
          const devList = Array.isArray(rawAlloc) ? rawAlloc : rawAlloc?.data || [];
          const mappedDevs: AllocatedDeveloper[] = devList
            .map((d: any) => ({
              userId: Number(d.employeeId || d.userId || d.id),
              userName: d.employeeName || d.userName || d.name || `Developer ${d.employeeId || d.userId || d.id}`,
              empId: Number(d.employeeId || d.userId || d.id),
            }))
            .filter((d: AllocatedDeveloper) => d.userId && d.userName);
          setSubmoduleAllocations((prev) => ({ ...prev, [Number(newSubmoduleId)]: mappedDevs }));
        })
        .catch((err) => console.error('Error loading allocations for submodule:', err))
        .finally(() => setAllocationsLoading(false));
    }
  };

  // ─── 7. Filtered Defect Rows for Table ─────────────────────────────────────────
  const filteredDefects = useMemo(() => {
    return activeDefects.filter((defect) => {
      // 1. Filter by Assigned Dev
      if (filterAssignee && String(defect.assigned_to_id) !== filterAssignee) {
        return false;
      }
      // 2. Filter by Module
      if (filterModule && String(defect.moduleId) !== filterModule) {
        return false;
      }
      // 3. Filter by Submodule
      if (filterSubmodule && String(defect.subModuleId) !== filterSubmodule) {
        return false;
      }
      return true;
    });
  }, [activeDefects, filterAssignee, filterModule, filterSubmodule]);

  // Pagination
  const totalPages = Math.ceil(filteredDefects.length / defectsPerPage) || 1;
  const paginatedDefects = useMemo(() => {
    const start = (currentPage - 1) * defectsPerPage;
    return filteredDefects.slice(start, start + defectsPerPage);
  }, [filteredDefects, currentPage, defectsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterAssignee, filterModule, filterSubmodule]);

  // ─── 8. Eligible Developers & Reassign To Calculation (Rules 8, 9, 10, 11, 19) ─
  // Available Developers = (Intersection of allocated devs across selected defects) - (Current Assignees)
  const { availableDevelopers, reasonMessage } = useMemo<{
    availableDevelopers: AllocatedDeveloper[];
    reasonMessage: string | null;
  }>(() => {
    // Before a submodule is selected, Reassign To is disabled
    if (!filterSubmodule) {
      return {
        availableDevelopers: [],
        reasonMessage: null,
      };
    }

    const subId = Number(filterSubmodule);
    const submoduleDevs = submoduleAllocations[subId] || [];

    // Case A: No defects selected yet
    if (selectedDefects.size === 0) {
      return {
        availableDevelopers: submoduleDevs,
        reasonMessage: null,
      };
    }

    // Get selected defect objects
    const selectedObjs = activeDefects.filter((d) => selectedDefects.has(d.id));

    // For each selected defect, find allocated developers of its submodule
    const perDefectAllocations: AllocatedDeveloper[][] = selectedObjs.map((d) => {
      const dSubId = Number(d.subModuleId || subId);
      return submoduleAllocations[dSubId] || [];
    });

    // Check if any selected defect's submodule has 0 allocated developers
    if (perDefectAllocations.some((devs) => devs.length === 0)) {
      return {
        availableDevelopers: [],
        reasonMessage:
          selectedObjs.length === 1
            ? 'No other developers are available for reassignment for this defect.'
            : 'No other developers are available for reassignment for the selected defects.',
      };
    }

    // Intersection of developers allocated to every selected defect's submodule
    let commonDevs = perDefectAllocations[0];
    for (let i = 1; i < perDefectAllocations.length; i++) {
      const nextIds = new Set(perDefectAllocations[i].map((dev) => dev.userId));
      commonDevs = commonDevs.filter((dev) => nextIds.has(dev.userId));
    }

    // A developer is available if:
    // 1. The developer is in commonDevs (allocated to all selected defects' submodules)
    // 2. The developer is NOT already assigned to ALL selected defects
    // (i.e. at least one selected defect is not currently assigned to this developer)
    const available = commonDevs.filter((dev) => {
      if (selectedObjs.length === 0) return true;
      return selectedObjs.some((d) => Number(d.assigned_to_id) !== dev.userId);
    });

    let msg: string | null = null;
    if (available.length === 0) {
      if (selectedObjs.length === 1) {
        msg = 'No other developers are available for reassignment for this defect.';
      } else {
        msg = 'No other developers are available for reassignment for the selected defects.';
      }
    }

    return {
      availableDevelopers: available,
      reasonMessage: msg,
    };
  }, [filterSubmodule, selectedDefects, activeDefects, submoduleAllocations]);

  // ─── 9. Checkbox Handlers ─────────────────────────────────────────────────────
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const allIds = paginatedDefects.map((d) => d.id);
      setSelectedDefects(new Set(allIds));
    } else {
      setSelectedDefects(new Set());
      setSelectedAssignee('');
    }
  };

  const handleSelectDefect = (defect: Defect, checked: boolean | 'indeterminate') => {
    const newSet = new Set(selectedDefects);
    if (checked === true) {
      newSet.add(defect.id);
    } else {
      newSet.delete(defect.id);
    }
    setSelectedDefects(newSet);
    if (newSet.size === 0) {
      setSelectedAssignee('');
    }
  };

  const isAllSelected =
    paginatedDefects.length > 0 && paginatedDefects.every((d) => selectedDefects.has(d.id));

  // ─── 10. Perform Reassign ─────────────────────────────────────────────────────
  const resetAll = () => {
    setSelectedDefects(new Set());
    setSelectedAssignee('');
    setFilterAssignee('');
    setFilterModule('');
    setFilterSubmodule('');
    setError(null);
    setSuccessNotice(null);
    setCurrentPage(1);
    setShowConfirmation(false);
    setPendingReassignData(null);
  };

  const executeReassign = async (defectIds: number[], assigneeId: number) => {
    setSubmitting(true);
    setError(null);
    setSuccessNotice(null);
    try {
      await onReassign(defectIds, assigneeId);
      const msg = `Successfully reassigned ${defectIds.length} defect(s)`;
      setSuccessNotice(msg);
      setSelectedDefects(new Set());
      setSelectedAssignee('');
      // Refetch defects
      await fetchAllDefects();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Reassignment failed:', err);
      setError(err.message || 'Failed to reassign defects. Please check your selection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassignClick = async () => {
    if (selectedDefects.size === 0) {
      setError('Please select at least one defect to reassign.');
      return;
    }

    if (!filterSubmodule) {
      setError('Please select a Submodule before reassigning.');
      return;
    }

    if (!selectedAssignee) {
      setError('Please select a developer to reassign to.');
      return;
    }

    const assigneeId = parseInt(selectedAssignee);
    const defectIds = Array.from(selectedDefects);

    // Check if one or more selected defects are already assigned to this developer
    const alreadyAssigned = defectIds.some((defectId) => {
      const d = activeDefects.find((x) => x.id === defectId);
      return d && Number(d.assigned_to_id) === assigneeId;
    });

    if (alreadyAssigned) {
      setConfirmationMessage(
        'One or more selected defects are already assigned to this developer.\nDo you want to continue?'
      );
      setPendingReassignData({ defectIds, assigneeId });
      setShowConfirmation(true);
      return;
    }

    await executeReassign(defectIds, assigneeId);
  };

  // Reassign button enabled rule (Rule 17)
  const isReassignEnabled =
    selectedDefects.size > 0 &&
    Boolean(filterSubmodule) &&
    Boolean(selectedAssignee) &&
    availableDevelopers.some((d) => String(d.userId) === selectedAssignee) &&
    !submitting;

  // Selected submodule display name
  const currentSubmoduleObj = allSubmodules.find((sm) => String(sm.id) === filterSubmodule);

  if (!can.defect.edit) {
    return (
      <Card className="mb-6 border border-yellow-200 bg-yellow-50">
        <CardContent className="p-4 text-center text-yellow-700">
          You do not have permission to reassign defects.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`border border-blue-200 bg-blue-50/20 shadow-sm ${className}`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-800">Reassign Defects</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {activeDefects.length} Active Defects
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Filter defects by developer, module, or submodule, and reassign them to an allocated developer.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={resetAll}
                className="text-gray-600 hover:text-gray-800 border-gray-300"
              >
                Reset Filters
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetAll();
                  onClose();
                }}
                className="border-gray-300 hover:bg-gray-100"
              >
                Close
              </Button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="mb-4 p-3.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* ─── 4 Filter Bar (Section 1 & 20) ─────────────────────────────────── */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 1. Filter by Assigned Dev (optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Filter by Assigned Dev
                </label>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm h-10 transition-colors"
                >
                  <option value="">All assigned developers</option>
                  {assignedDevOptions.map((dev) => (
                    <option key={dev.value} value={dev.value}>
                      {dev.label}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {assignedDevOptions.length} developer(s) currently assigned
                </span>
              </div>

              {/* 2. Filter by Module (optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Filter by Module
                </label>
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm h-10 transition-colors"
                >
                  <option value="">All modules</option>
                  {availableModuleOptions.map((mod) => (
                    <option key={mod.id} value={String(mod.id)}>
                      {mod.name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {availableModuleOptions.length} module(s) available
                </span>
              </div>

              {/* 3. Filter by Submodule (mandatory before reassignment) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Filter by Submodule <span className="text-red-500 font-bold">*</span>
                  </label>
                  {!filterSubmodule && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                      Required
                    </span>
                  )}
                </div>
                <select
                  value={filterSubmodule}
                  onChange={(e) => handleSubmoduleChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white text-sm h-10 transition-colors ${
                    !filterSubmodule
                      ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500'
                      : 'border-green-400 ring-1 ring-green-400 focus:ring-green-500'
                  }`}
                >
                  <option value="">All submodules</option>
                  {availableSubmoduleOptions.map((sub) => (
                    <option key={sub.id} value={String(sub.id)}>
                      {sub.name} {filterModule ? '' : `(${sub.moduleName})`}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {availableSubmoduleOptions.length} submodule(s) available
                </span>
              </div>

              {/* 4. Reassign To (mandatory developer selection) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Reassign To <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => {
                    setSelectedAssignee(e.target.value);
                    setError(null);
                  }}
                  disabled={!filterSubmodule || allocationsLoading || availableDevelopers.length === 0}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm h-10 transition-colors ${
                    !filterSubmodule
                      ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                      : availableDevelopers.length === 0
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-white border-blue-400 focus:ring-blue-500 text-gray-800'
                  }`}
                >
                  <option value="">
                    {!filterSubmodule
                      ? 'Select submodule first'
                      : allocationsLoading
                      ? 'Loading developers...'
                      : availableDevelopers.length === 0
                      ? 'No other developers available'
                      : 'Select developer'}
                  </option>
                  {availableDevelopers.map((dev) => (
                    <option key={dev.userId} value={String(dev.userId)}>
                      {dev.userName}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {!filterSubmodule
                    ? 'Requires submodule selection'
                    : allocationsLoading
                    ? 'Fetching allocated devs...'
                    : `${availableDevelopers.length} developer(s) eligible`}
                </span>
              </div>
            </div>

            {/* Warning Message Banner when No Other Developer Available (Rule 10 & 13) */}
            {filterSubmodule && selectedDefects.size > 0 && availableDevelopers.length === 0 && (
              <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm flex items-start gap-2.5 animate-fadeIn">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{reasonMessage}</div>
                  <div className="text-xs text-amber-700 mt-0.5">
                    The current assignee is the only developer allocated to this submodule, or no other allocated developer is available for reassignment.
                  </div>
                </div>
              </div>
            )}

            {/* Selection Status & Reassign Action Bar */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-900">
                  {selectedDefects.size} of {filteredDefects.length} defect(s) selected
                </span>

                {filterSubmodule && currentSubmoduleObj && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Submodule: {currentSubmoduleObj.name}
                  </span>
                )}

                {selectedDefects.size > 0 && selectedAssignee && isReassignEnabled && (
                  <span className="inline-flex items-center text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Ready to reassign {selectedDefects.size} defect(s)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleReassignClick}
                  disabled={!isReassignEnabled}
                  className={`px-6 py-2 rounded-lg font-medium text-sm transition-all shadow-sm ${
                    isReassignEnabled
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                  }`}
                >
                  {submitting ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⟳</span>
                      Reassigning...
                    </>
                  ) : (
                    `Reassign (${selectedDefects.size})`
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* ─── Defects Table ─────────────────────────────────────────────────── */}
          <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-4 py-3.5 w-12 text-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      disabled={paginatedDefects.length === 0}
                    />
                  </th>
                  <th className="px-4 py-3.5">Defect ID</th>
                  <th className="px-4 py-3.5 min-w-[200px]">Description</th>
                  <th className="px-4 py-3.5">Module</th>
                  <th className="px-4 py-3.5">Submodule</th>
                  <th className="px-4 py-3.5 min-w-[140px]">Current Assignee</th>
                  <th className="px-4 py-3.5 min-w-[100px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoadingDefects ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-500">Loading active defects...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedDefects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <AlertCircle className="w-8 h-8 text-gray-300" />
                        <span className="font-medium">
                          {activeDefects.length === 0
                            ? 'No active defects found for this project.'
                            : 'No defects match the selected filters.'}
                        </span>
                        <span className="text-xs text-gray-400">
                          Try adjusting your Assigned Dev, Module, or Submodule filter.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedDefects.map((defect) => {
                    const isSelected = selectedDefects.has(defect.id);
                    return (
                      <tr
                        key={defect.id}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={(e) => {
                          // Prevent toggling when clicking directly on interactive controls
                          if ((e.target as HTMLElement).tagName === 'INPUT') return;
                          handleSelectDefect(defect, !isSelected);
                        }}
                      >
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectDefect(defect, checked)}
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-600 whitespace-nowrap">
                          {defect.defectId}
                        </td>
                        <td
                          className="px-4 py-3 text-gray-700 max-w-[260px] truncate"
                          title={defect.description}
                        >
                          {defect.description || defect.title || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {defect.module_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-xs bg-gray-100 font-medium text-gray-700">
                            {defect.sub_module_name || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {defect.assigned_to_name ? (
                            <span className="font-medium text-gray-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              {defect.assigned_to_name}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              (defect.defect_status_name || '').toUpperCase() === 'NEW'
                                ? 'bg-emerald-100 text-emerald-800'
                                : (defect.defect_status_name || '').toUpperCase() === 'OPEN'
                                ? 'bg-blue-100 text-blue-800'
                                : (defect.defect_status_name || '').toUpperCase() === 'IN_PROGRESS'
                                ? 'bg-amber-100 text-amber-800'
                                : (defect.defect_status_name || '').toUpperCase() === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : (defect.defect_status_name || '').toUpperCase() === 'ON_HOLD'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {defect.defect_status_name || '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ─── Pagination Footer ──────────────────────────────────────────────── */}
          <div className="mt-4 flex items-center justify-between flex-wrap gap-2 pt-2">
            <div className="text-xs text-gray-500">
              Showing {filteredDefects.length > 0 ? (currentPage - 1) * defectsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * defectsPerPage, filteredDefects.length)} of {filteredDefects.length} defect(s)
              {filteredDefects.length !== activeDefects.length && ` (filtered from ${activeDefects.length} total)`}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>

                <span className="text-xs text-gray-700 px-2 font-medium">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>

                <select
                  value={defectsPerPage}
                  onChange={(e) => {
                    setDefectsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="ml-2 border border-gray-200 rounded px-2 py-1 text-xs bg-white"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={showConfirmation}
        message={confirmationMessage}
        onConfirm={() => {
          setShowConfirmation(false);
          if (pendingReassignData) {
            executeReassign(pendingReassignData.defectIds, pendingReassignData.assigneeId);
            setPendingReassignData(null);
          }
        }}
        onCancel={() => {
          setShowConfirmation(false);
          setPendingReassignData(null);
        }}
        confirmText="Continue"
        cancelText="Cancel"
        title="Confirm Reassign"
        type="warning"
      />
    </>
  );
};