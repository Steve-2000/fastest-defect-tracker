import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const deleteProject = async (id) => {
  const r = await apiClient.delete(ENDPOINTS.projectById(Number(id)));
  return r.data;
};
