import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getUsersByAllocation = async (projectId) => {
  try { const r = await apiClient.get(ENDPOINTS.GET_PROJECT_ALLOCATED_EMPLOYEES(projectId)); return r.data.data ?? []; }
  catch { return []; }
};

export const getUsersByModuleSubmoduleAllocation = getUsersByAllocation;

export const getUsersBySubmoduleAllocation = getUsersByAllocation;
