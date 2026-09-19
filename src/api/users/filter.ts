import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const filterUsers = async (filters={}) => {
  try { const r = await apiClient.get(ENDPOINTS.employee); return r.data.data ?? r.data ?? []; }
  catch { return []; }
};
