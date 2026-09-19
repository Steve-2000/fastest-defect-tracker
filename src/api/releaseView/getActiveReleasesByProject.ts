import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getActiveReleasesByProject = async (projectId) => {
  try { const r = await apiClient.get(ENDPOINTS.releaseActiveByProject(projectId)); return r.data.data ?? []; }
  catch { return []; }
};
