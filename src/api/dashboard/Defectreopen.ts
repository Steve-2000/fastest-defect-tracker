import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getDefectReopened = async (projectId: number) => { try { const r = await apiClient.get(ENDPOINTS.dashboardReopenedByProject(projectId)); return r.data.data??[]; } catch { return []; } };
export const getReopenCountSummary = getDefectReopened;
