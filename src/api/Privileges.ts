import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";
export const getRolePermissionMatrix = async () => {
  try { const r = await apiClient.get(ENDPOINTS.rolePermissionMatrix); return r.data.data ?? {}; }
  catch { return {}; }
};
export const getRolePermissionMatrixByRoleId = async (roleId) => {
  try { const r = await apiClient.get(ENDPOINTS.rolePermissionMatrixByRoleId(roleId)); return r.data.data ?? {}; }
  catch { return {}; }
};
export const updateRolePermissionMatrix = async (roleId, data) => {
  const r = await apiClient.put(ENDPOINTS.rolePermissionMatrixByRoleId(roleId), data);
  return r.data;
};

export const getRolePermissionByRoleId = getRolePermissionMatrixByRoleId;

export const addRolePermission = async (data: any) => { return {}; };
export const getAllEmployeePermission = async () => { return []; };
export const getAllPrivileges = async () => { return []; };
export const getRolePermission = async () => { return []; };

export const addEmployeePermission = async (data: any) => { return {}; };
