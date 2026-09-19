import apiClient from "../../lib/api"; import { ENDPOINTS } from "../../utils/apiendpoint";
export const getSubmodulesByModule = async (mid: any) => {
  try {
    const r = await apiClient.get(ENDPOINTS.subModule(mid));
    const raw = r.data?.data ?? r.data ?? [];
    const list: any = Array.isArray(raw) ? raw : [];
    list.data = list;
    return list;
  } catch {
    const empty: any = [];
    empty.data = empty;
    return empty;
  }
};
export default getSubmodulesByModule;
