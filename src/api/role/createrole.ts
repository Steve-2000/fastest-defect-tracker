import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const createRole = async (data: any) => { const r = await apiClient.post(ENDPOINTS.role,data); return r.data; };
export const createRoles = createRole;
