import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export interface TimeToFindDefectsResponse { data?: any[]; }
export interface TimeToFixDefectsResponse { data?: any[]; }

export const getDefectSeveritySummary = async (projectId: number, releaseId: number) => {
  try { const r = await apiClient.get(ENDPOINTS.dashboard(projectId,releaseId)); return r.data.data??{}; }
  catch { return {}; }
};
export const getReleaseDefectsDaily = async (projectId: number, releaseId: number) => {
  try { const r = await apiClient.get(ENDPOINTS.dashboardTimeToFind(projectId,releaseId)); return r.data.data??[]; }
  catch { return []; }
};
export const getReleaseDefectsFixedDaily = async (projectId: number, releaseId: number) => {
  try { const r = await apiClient.get(ENDPOINTS.dashboardTimeToFix(projectId,releaseId)); return r.data.data??[]; }
  catch { return []; }
};
export const getTimeToFixDefectsDaily = getReleaseDefectsFixedDaily;
export const getReleaseDailyDefects = getReleaseDefectsDaily;
export const getReleaseDailyFixedDefects = getReleaseDefectsFixedDaily;
export const getDashboardSummary = getDefectSeveritySummary;
