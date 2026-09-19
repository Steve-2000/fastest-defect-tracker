import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export const getKLOC = async () => { try { const r = await apiClient.get(ENDPOINTS.gitKloc); return r.data.data??[]; } catch { return []; } };
export const getKILOC = getKLOC;
export const getReleaseKLOC = async (releaseId: number) => { try { const r = await apiClient.get(ENDPOINTS.releaseKlocById(releaseId)); return r.data.data??[]; } catch { return []; } };
export const getDefectDensity = async (projectId: number) => { try { const r = await apiClient.get(ENDPOINTS.defectDensity(projectId)); return r.data.data??{}; } catch { return {}; } };
export const getProjectKloc = async (projectId: number) => { try { const r = await apiClient.get(ENDPOINTS.projectKloc(projectId)); return r.data.data??[]; } catch { return []; } };
export const getDefectCreatedCount = async (projectId: number, releaseId: number) => { try { const r = await apiClient.get(ENDPOINTS.defectCountByCreated(projectId,releaseId)); return r.data.data??[]; } catch { return []; } };
export const getDefectFixedCount = async (projectId: number, releaseId: number) => { try { const r = await apiClient.get(ENDPOINTS.defectFixedCount(projectId,releaseId)); return r.data.data??[]; } catch { return []; } };
export const getDefectStatusLog = async (projectId: number, releaseId: number) => { try { const r = await apiClient.get(ENDPOINTS.defectStatusLog(projectId,releaseId)); return r.data.data??[]; } catch { return []; } };
export const getDashboard = async (projectId: number, releaseId: number) => { try { const r = await apiClient.get(ENDPOINTS.dashboard(projectId,releaseId)); return r.data.data??{}; } catch { return {}; } };
export const getDashboardTimeToFind = async (projectId: number, releaseId: number) => { try { const r = await apiClient.get(ENDPOINTS.dashboardTimeToFind(projectId,releaseId)); return r.data.data??[]; } catch { return []; } };
export const getDashboardTimeToFix = async (projectId: number, releaseId: number) => { try { const r = await apiClient.get(ENDPOINTS.dashboardTimeToFix(projectId,releaseId)); return r.data.data??[]; } catch { return []; } };
