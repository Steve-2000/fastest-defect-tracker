import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const updateUser = async (id, data) => {
  const r = await apiClient.put(ENDPOINTS.employeeById(Number(id)), data);
  return r.data;
};
export const updateUserStatus = async (id, status) => {
  const r = await apiClient.patch(ENDPOINTS.employeeStatus(Number(id)), { status });
  return r.data;
};
