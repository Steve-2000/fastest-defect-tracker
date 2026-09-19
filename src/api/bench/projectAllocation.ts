import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export const getBenchProjectAllocations = async () => {
  try { const r = await apiClient.get(ENDPOINTS.projectAllocation); return r.data.data ?? r.data ?? []; }
  catch { return []; }
};

export const getDevelopersWithRolesByProjectId = async (projectId: number) => {
  try { const r = await apiClient.get(ENDPOINTS.GET_PROJECT_ALLOCATED_EMPLOYEES(projectId)); return r.data.data ?? []; }
  catch { return []; }
};

export const getViewAllocations = async (userId: number | string) => {
  try { const r = await apiClient.get(ENDPOINTS.projectAllocationByEmployee(Number(userId))); return r.data.data ?? []; }
  catch { return []; }
};

export const postProjectAllocations = async (data: any) => {
  const r = await apiClient.post(ENDPOINTS.projectAllocation, data);
  return r.data;
};

export const getProjectAllocationsById = async (id: number | string) => {
  const r = await apiClient.get(ENDPOINTS.projectAllocationProjectEmployee(Number(id)));
  return r.data;
};

export const updateProjectAllocation = async (id: number, data: any) => {
  const r = await apiClient.put(`${ENDPOINTS.projectAllocation}/${id}`, data);
  return r.data;
};

export const deleteProjectAllocation = async (id: number) => {
  const r = await apiClient.delete(ENDPOINTS.projectAllocationDeallocate(id));
  return r.data;
};

export const getMaxAvailablePercentage = async (id: number) => 100;
