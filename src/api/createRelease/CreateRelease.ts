import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const createRelease = async (data) => {
  const r = await apiClient.post(ENDPOINTS.release, data);
  return r.data;
};
