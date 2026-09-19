import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";
export const allocateDevToSubModule = async (subModuleId: number, data: any) => { 
  const payload = typeof data === 'number' ? { employeeId: data, userId: data } : (data && typeof data === 'object' ? { employeeId: data.employeeId || data.userId, userId: data.userId || data.employeeId, ...data } : data);
  const r = await apiClient.post(ENDPOINTS.subModuleDev(subModuleId), payload); 
  return r.data; 
};
export const deallocateDevFromSubModule = async (moduleId: number, employeeId: number) => { const r = await apiClient.delete(ENDPOINTS.subModuleDevDelete(moduleId,employeeId)); return r.data; };
export const getAllSubmoduleAllocatedDevBySubmoduleId = async (subModuleId: number) => {
  try {
    const r = await apiClient.get(ENDPOINTS.subModuleDev(subModuleId));
    const raw = r.data?.data ?? r.data ?? [];
    const list: any = Array.isArray(raw) ? raw : [];
    list.data = list;
    return list;
  } catch {
    const empty: any = [];
    empty.data = empty;
    return empty;
  }
};

export interface SubModuleDevAllocation {
  id?: number;
  subModuleId: number;
  employeeId: number;
  employeeName?: string;
  roleId?: number;
  roleName?: string;
}

export const allocateProjectEmployeeToSubModule = allocateDevToSubModule;
export const deAllocateProjectEmployeeFromSubModule = deallocateDevFromSubModule;
