import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const searchRelease = async (query="") => {
  try { const r = await apiClient.get(ENDPOINTS.release); const list = r.data.data ?? r.data ?? []; return list.filter(x => x.name?.toLowerCase().includes(query.toLowerCase())); }
  catch { return []; }
};
