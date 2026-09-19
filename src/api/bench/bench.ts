import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export async function getBenchList() {
  try { const r = await apiClient.get(ENDPOINTS.benchEmployee); return r.data.data ?? r.data ?? []; }
  catch { return []; }
}
export const getViewAllocation = async (userId) => {
  const r = await apiClient.get(ENDPOINTS.projectAllocationByEmployee(Number(userId)));
  return { data: { availablePeriods: r.data.data ?? [] } };
};
export async function getEmployeeDetails(id) {
  const r = await apiClient.get(ENDPOINTS.employeeById(Number(id)));
  return r.data.data ?? r.data;
}
export const getBenchAvailability = async (page=0, size=5) => {
  try {
    const r = await apiClient.get(ENDPOINTS.benchEmployee);
    const list = r.data.data ?? r.data ?? [];
    return { status:"success", statusCode:200, data:{ content:list, totalElements:list.length, totalPages:Math.ceil(list.length/size), size, number:page } };
  } catch { return { status:"success", statusCode:200, data:{ content:[], totalElements:0, totalPages:0, size, number:page } }; }
};
export const getEmployeeProjectHistory = async (userId) => {
  const r = await apiClient.get(ENDPOINTS.projectAllocationByEmployee(Number(userId)));
  return { data: r.data.data ?? [] };
};
