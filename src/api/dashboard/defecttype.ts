import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getDefectByType = async (projectId: number) => { try { const r = await apiClient.get(ENDPOINTS.defectByType(projectId)); return r.data.data??[]; } catch { return []; } };
export const getDefectTypeByProjectId = getDefectByType;
