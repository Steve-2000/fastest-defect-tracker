import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getAllSubmoduleAllocatedDevsWithName = async (subModuleId: number) => { try { const r = await apiClient.get(ENDPOINTS.subModuleDev(subModuleId)); return r.data.data??[]; } catch { return []; } };
export default getAllSubmoduleAllocatedDevsWithName;
