import apiClient from "../../lib/api"; import { ENDPOINTS } from "../../utils/apiendpoint";
export const updateRole = async (id, data) => { const r = await apiClient.put(ENDPOINTS.roleById(id),data); return r.data; };
