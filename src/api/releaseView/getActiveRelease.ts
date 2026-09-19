import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getActiveRelease = async (releaseId) => {
  const r = await apiClient.get(ENDPOINTS.releaseById(releaseId));
  return r.data.data ?? r.data;
};
