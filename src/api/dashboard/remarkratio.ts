import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getDefectRemarkRatioByProjectId = async (projectId: number) => { try { const r = await apiClient.get(ENDPOINTS.defectDensity(projectId)); return r.data.data??{}; } catch { return {}; } };
