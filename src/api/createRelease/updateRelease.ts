import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const updateRelease = async (id, data) => {
  const r = await apiClient.put(ENDPOINTS.releaseById(Number(id)), data);
  return r.data;
};
