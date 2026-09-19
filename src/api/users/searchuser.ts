import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const searchUser = async (query="") => {
  try {
    const r = await apiClient.get(ENDPOINTS.employee);
    const list = r.data.data ?? r.data ?? [];
    return list.filter(u => u.name?.toLowerCase().includes(query.toLowerCase()) || u.email?.toLowerCase().includes(query.toLowerCase()));
  } catch { return []; }
};
