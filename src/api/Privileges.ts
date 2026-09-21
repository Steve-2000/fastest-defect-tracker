import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";

export const getRolePermissionMatrix = async () => {
  try {
    const r = await apiClient.get(ENDPOINTS.rolePermissionMatrix);
    return r.data?.data ?? {};
  } catch {
    return {};
  }
};

export const getRolePermissionMatrixByRoleId = async (roleId: number | string) => {
  try {
    const r = await apiClient.get(ENDPOINTS.rolePermissionMatrixByRoleId(Number(roleId)));
    const permissionIds = r.data?.data?.permissionIds || r.data?.permissionIds || [];
    return {
      ...r.data,
      permissionIds: permissionIds.map(String)
    };
  } catch {
    return { permissionIds: [] };
  }
};

export const updateRolePermissionMatrix = async (roleId: number | string, data: any) => {
  const r = await apiClient.put(ENDPOINTS.rolePermissionMatrixByRoleId(Number(roleId)), data);
  return r.data;
};

export const getRolePermissionByRoleId = getRolePermissionMatrixByRoleId;

export const addRolePermission = async (roleId: number, data: any) => {
  const r = await apiClient.post(ENDPOINTS.rolePermissionMatrixByRoleId(roleId), data);
  return r.data;
};

export const getAllEmployeePermission = async (employeeId: number) => {
  const r = await apiClient.get(ENDPOINTS.employeePermission(employeeId));
  return r.data;
};

export const getAllPrivileges = async () => {
  const r = await apiClient.get(ENDPOINTS.permission);
  return r.data;
};

export const getRolePermission = async (roleId: number) => {
  const r = await apiClient.get(ENDPOINTS.rolePermissionMatrixByRoleId(roleId));
  return r.data;
};

export const addEmployeePermission = async (employeeId: number, data: any) => {
  const r = await apiClient.post(ENDPOINTS.employeePermission(employeeId), data);
  return r.data;
};
