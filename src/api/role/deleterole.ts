import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const deleteRole = async (id: number) => { const r = await apiClient.delete(ENDPOINTS.roleById(id)); return r.data; };
export const deleterole = deleteRole;
