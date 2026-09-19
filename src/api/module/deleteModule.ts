import apiClient from "../../lib/api"; import { ENDPOINTS } from "../../utils/apiendpoint";
export const deleteModule = async (pid, id) => { const r=await apiClient.delete(ENDPOINTS.moduleById(pid,id)); return r.data; };
