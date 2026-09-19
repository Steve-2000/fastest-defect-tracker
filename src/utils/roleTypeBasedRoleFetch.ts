import apiClient from "../lib/api";
import { ENDPOINTS } from "./apiendpoint";
export const getRolesByType = async (type="") => {
  try { const r = await apiClient.get(ENDPOINTS.role); const list = r.data.data ?? r.data ?? []; return type ? list.filter(x => x.type === type) : list; }
  catch { return []; }
};

export const roleTypeBasedRoleFetch = getRolesByType;

export const roleTypeBasedRoleIdFetch = getRolesByType;

export const roleTypesBasedRoleFetch = getRolesByType;
