import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const updateProject = async (id, data) => {
  const r = await apiClient.put(ENDPOINTS.projectById(Number(id)), data);
  return r.data;
};
