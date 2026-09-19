import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const createProject = async (data) => {
  const r = await apiClient.post(ENDPOINTS.project, data);
  return r.data;
};
