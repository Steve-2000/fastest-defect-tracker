import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export const getDefectReopened = async (projectId: number | string) => {
  try {
    const r = await apiClient.get(ENDPOINTS.dashboardReopenedByProject(Number(projectId)));
    return r.data;
  } catch {
    return { data: [] };
  }
};

export const getReopenCountSummary = getDefectReopened;
