import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getModuleDevelopers = async (subModuleId: number) => { try { const r = await apiClient.get(ENDPOINTS.subModuleDev(subModuleId)); return r.data.data??[]; } catch { return []; } };
export const getDevelopersByModuleId = getModuleDevelopers;
