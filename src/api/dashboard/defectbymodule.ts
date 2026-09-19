import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getDefectByModule = async (projectId: number) => { try { const r = await apiClient.get(ENDPOINTS.defectByModules(projectId)); return r.data.data??[]; } catch { return []; } };
export const getDefectsByModule = getDefectByModule;
