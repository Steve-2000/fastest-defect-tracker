import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export const deallocateDeveloper = async (moduleId: number, employeeId: number) => {
  const r = await apiClient.delete(ENDPOINTS.subModuleDevDelete(moduleId, employeeId));
  return r.data;
};

export const deallocateModuleLeaderWithAllocateModuleId = async (allocationId: number) => {
  const r = await apiClient.delete(ENDPOINTS.DEALLOCATE_MODULE_LEADER(allocationId));
  return r.data;
};

export const deallocateDeveloperFromModule = async (projectId: number, moduleId: number, developerId: number) => {
  const r = await apiClient.delete(ENDPOINTS.DEALLOCATE_MODULE_LEADER(developerId));
  return r.data;
};

export const deallocateDevelopers = deallocateModuleLeaderWithAllocateModuleId;

export const reassignDeveloperWithAllocateModuleId = async (id: number, data: any) => { return deallocateDevelopers(id); };
export const reassignSubmoduleDeveloperWithAllocateModuleId = async (id: number, data: any) => { return deallocateDevelopers(id); };
