import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getDefectSeverityIndex = async (projectId: number) => { try { const r = await apiClient.get(ENDPOINTS.defectSeverityBreakdown(projectId)); return r.data.data??{}; } catch { return {}; } };
