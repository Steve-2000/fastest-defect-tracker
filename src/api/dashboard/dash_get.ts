import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export interface TimeToFindDefectsResponse { data?: any[]; }
export interface TimeToFixDefectsResponse { data?: any[]; dailyData?: any[]; }

export const getDefectSeveritySummary = async (projectId: number | string, releaseId?: number | string) => {
  try {
    const url = (releaseId && String(releaseId) !== "undefined" && Number(releaseId) > 0)
      ? ENDPOINTS.dashboard(Number(projectId), Number(releaseId))
      : `/api/v1/project/${projectId}/dashboard`;
    const r = await apiClient.get(url);
    return r.data;
  } catch {
    return { data: { totalRemark: 0, totalDefects: 0, severities: [] } };
  }
};

export const getReleaseDefectsDaily = async (projectId: number | string, releaseId?: number | string) => {
  try {
    const url = (releaseId && String(releaseId) !== "undefined" && Number(releaseId) > 0)
      ? ENDPOINTS.dashboardTimeToFind(Number(projectId), Number(releaseId))
      : `/api/v1/project/${projectId}/dashboard/time-to-find`;
    const r = await apiClient.get(url);
    return r.data;
  } catch {
    return { data: [] };
  }
};

export const getReleaseDefectsFixedDaily = async (projectId: number | string, releaseId?: number | string) => {
  try {
    const url = (releaseId && String(releaseId) !== "undefined" && Number(releaseId) > 0)
      ? ENDPOINTS.dashboardTimeToFix(Number(projectId), Number(releaseId))
      : `/api/v1/project/${projectId}/dashboard/time-to-fixed`;
    const r = await apiClient.get(url);
    return r.data;
  } catch {
    return { data: [], dailyData: [] };
  }
};

export const getTimeToFixDefectsDaily = getReleaseDefectsFixedDaily;
export const getReleaseDailyDefects = getReleaseDefectsDaily;
export const getReleaseDailyFixedDefects = getReleaseDefectsFixedDaily;
export const getDashboardSummary = getDefectSeveritySummary;
