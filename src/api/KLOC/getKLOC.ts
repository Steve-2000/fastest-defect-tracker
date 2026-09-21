import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export interface DefectDensityData {
  kloc: number;
  totalDefects: number;
  defectDensity: number;
}

export const getKLOC = async (projectId?: number) => {
  try {
    const url = projectId ? ENDPOINTS.projectKloc(projectId) : ENDPOINTS.gitKloc;
    const r = await apiClient.get(url);
    return r.data;
  } catch {
    return { data: { kloc: 1.0 } };
  }
};
export const getKILOC = getKLOC;

export const getReleaseKLOC = async (releaseId: number) => {
  try {
    const r = await apiClient.get(ENDPOINTS.releaseKlocById(releaseId));
    return r.data;
  } catch {
    return { data: { kloc: 1.0 } };
  }
};

export const getDefectDensity = async (projectId: number) => {
  try {
    const r = await apiClient.get(ENDPOINTS.defectDensity(projectId));
    return r.data;
  } catch {
    return { data: { kloc: 1.0, totalDefects: 0, defectDensity: 0, ratio: "1:0", category: "low", color: "#22c55e" } };
  }
};

export const getProjectKloc = async (projectId: number) => {
  try {
    const r = await apiClient.get(ENDPOINTS.projectKloc(projectId));
    return r.data;
  } catch {
    return { data: { kloc: 1.0 } };
  }
};

export const getDefectCreatedCount = async (projectId: number, releaseId: number) => {
  try {
    const r = await apiClient.get(ENDPOINTS.defectCountByCreated(projectId, releaseId));
    return r.data;
  } catch {
    return { data: { count: 0 } };
  }
};

export const getDefectFixedCount = async (projectId: number, releaseId: number) => {
  try {
    const r = await apiClient.get(ENDPOINTS.defectFixedCount(projectId, releaseId));
    return r.data;
  } catch {
    return { data: { count: 0 } };
  }
};

export const getDefectStatusLog = async (projectId: number, releaseId: number) => {
  try {
    const r = await apiClient.get(ENDPOINTS.defectStatusLog(projectId, releaseId));
    return r.data;
  } catch {
    return { data: [] };
  }
};

export const getDashboard = async (projectId: number, releaseId?: number) => {
  try {
    const url = releaseId ? ENDPOINTS.dashboard(projectId, releaseId) : `/api/v1/project/${projectId}/dashboard`;
    const r = await apiClient.get(url);
    return r.data;
  } catch {
    return { data: {} };
  }
};

export const getDashboardTimeToFind = async (projectId: number, releaseId?: number) => {
  try {
    const url = releaseId ? ENDPOINTS.dashboardTimeToFind(projectId, releaseId) : `/api/v1/project/${projectId}/dashboard/time-to-find`;
    const r = await apiClient.get(url);
    return r.data;
  } catch {
    return { data: [] };
  }
};

export const getDashboardTimeToFix = async (projectId: number, releaseId?: number) => {
  try {
    const url = releaseId ? ENDPOINTS.dashboardTimeToFix(projectId, releaseId) : `/api/v1/project/${projectId}/dashboard/time-to-fixed`;
    const r = await apiClient.get(url);
    return r.data;
  } catch {
    return { data: [] };
  }
};
