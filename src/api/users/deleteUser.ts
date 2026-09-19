import apiClient from "../../lib/api"; import { ENDPOINTS } from "../../utils/apiendpoint";
export const deleteUser = async (id) => { const r = await apiClient.delete(ENDPOINTS.employeeById(Number(id))); return r.data; };
