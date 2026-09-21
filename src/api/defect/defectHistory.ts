import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export interface DefectHistoryEntry {
  assignedByName: string;
  assignedToName: string;
  defectDate: string;
  defectTime: string;
  previousStatus: string;
  defectStatus: string;
  name: string;       // release name
  updatedBy: string;
  action?: string;
}

/** Fetches the single defect object (not history). */
export const getDefectHistory = async (defectId: number) => {
  try {
    const r = await apiClient.get(ENDPOINTS.defectById(defectId));
    return r.data.data ?? {};
  } catch {
    return {};
  }
};

/** Fetches a defect's history log from /api/v1/defect/{id}/history. */
export const getDefectHistoryByDefectId = async (
  defectId: number | string
): Promise<DefectHistoryEntry[]> => {
  try {
    const r = await apiClient.get(`/api/v1/defect/${defectId}/history`);
    // Backend returns ApiResponse: { data: [ ...entries ] }
    const list: any[] =
      r.data?.data ?? r.data?.content ?? (Array.isArray(r.data) ? r.data : []);
    return list as DefectHistoryEntry[];
  } catch (err: any) {
    console.error("Failed to fetch defect history:", err);
    throw new Error(
      err?.response?.data?.message || err?.message || "Failed to fetch defect history"
    );
  }
};

export const getDefectStatusLog = async (projectId: number, releaseId: number) => {
  try {
    const r = await apiClient.get(ENDPOINTS.defectStatusLog(projectId, releaseId));
    return r.data.data ?? [];
  } catch {
    return [];
  }
};

export const getDefectById = async (id: number) => {
  try {
    const r = await apiClient.get(ENDPOINTS.defectById(id));
    return r.data.data ?? {};
  } catch {
    return {};
  }
};
