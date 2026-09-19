import apiClient from "../../lib/api"; import { ENDPOINTS } from "../../utils/apiendpoint";
export const getModulesByProject = async (pid: any) => {
  try {
    const r = await apiClient.get(ENDPOINTS.module(pid));
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
export const getModuleById = async (pid,id) => { const r=await apiClient.get(ENDPOINTS.moduleById(pid,id)); return r.data.data??r.data; };
