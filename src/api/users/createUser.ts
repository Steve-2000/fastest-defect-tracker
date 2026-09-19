import apiClient from "../../lib/api"; import { ENDPOINTS } from "../../utils/apiendpoint";
export const createUser = async (data) => { const r = await apiClient.post(ENDPOINTS.employee,data); return r.data; };
