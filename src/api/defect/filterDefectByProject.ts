export interface FilteredDefect { id: number; title?: string; status?: string; priority?: string; severity?: string; projectId?: number; releaseId?: number; }

import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export const filterDefectByProject = async (projectId: number) => {
  try { const r = await apiClient.get(ENDPOINTS.defectByProject(projectId)); return r.data.data??r.data??[]; }
  catch { return []; }
};
export const getDefectsByProjectId = filterDefectByProject;
export const getDefectsByProject = filterDefectByProject;
export const filterDefects = async (params: any) => {
  try {
    const pid = params.projectId ?? params.project_id ?? 0;
    const r = await apiClient.get(ENDPOINTS.defectByProject(pid));
    return r.data.data??r.data??[];
  } catch { return []; }
};
export default filterDefectByProject;


export const filterDefectsForTest = filterDefects;
