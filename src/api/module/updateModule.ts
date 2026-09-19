import apiClient from "../../lib/api"; import { ENDPOINTS } from "../../utils/apiendpoint";
export const updateModule = async (pid, id, data) => { const r=await apiClient.put(ENDPOINTS.moduleById(pid,id),data); return r.data; };
