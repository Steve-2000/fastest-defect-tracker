import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export const getModule = async (projectId: number, id: number) => {
  const r = await apiClient.get(ENDPOINTS.moduleById(projectId, id));
  return r.data.data ?? r.data;
};

// Alias used by AppContext
export const getModulesByProjectId = async (projectId: number) => {
  try {
    const r = await apiClient.get(ENDPOINTS.module(projectId));
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

export default getModule;
