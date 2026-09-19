import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getDefectHistory = async (defectId: number) => { try { const r = await apiClient.get(ENDPOINTS.defectById(defectId)); return r.data.data??{}; } catch { return {}; } };
export const getDefectStatusLog = async (projectId: number, releaseId: number) => { try { const r = await apiClient.get(ENDPOINTS.defectStatusLog(projectId,releaseId)); return r.data.data??[]; } catch { return []; } };
export const getDefectById = async (id: number) => { try { const r = await apiClient.get(ENDPOINTS.defectById(id)); return r.data.data??{}; } catch { return {}; } };

export const getDefectHistoryByDefectId = getDefectHistory;
