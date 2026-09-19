import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export interface Submodule { id: number; name: string; description?: string; moduleId?: number; }
export const getSubmodule = async (moduleId: number) => {
  try {
    const r = await apiClient.get(ENDPOINTS.subModule(moduleId));
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
export const getSubmodulesByModuleId = getSubmodule;
export default getSubmodule;

export const getSubmodulesByModule = getSubmodule;
