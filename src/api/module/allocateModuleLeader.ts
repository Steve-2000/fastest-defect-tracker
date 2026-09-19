import apiClient from "../../lib/api"; import { ENDPOINTS } from "../../utils/apiendpoint";
export const allocateModuleLeader = async (data) => { const r=await apiClient.post(ENDPOINTS.ALLOCATE_MODULE_LEADER,data); return r.data; };
export const deallocateModuleLeader = async (id) => { const r=await apiClient.delete(ENDPOINTS.DEALLOCATE_MODULE_LEADER(id)); return r.data; };
export const getModuleAllocatedLeader = async (mid: any) => {
  try {
    const r = await apiClient.get(ENDPOINTS.GET_MODULE_ALLOCATED_LEADER(mid));
    if (Array.isArray(r.data)) return r.data;
    if (r.data?.data && Array.isArray(r.data.data)) return r.data.data;
    return [];
  } catch (e) {
    console.error("Error in getModuleAllocatedLeader:", e);
    return [];
  }
};
