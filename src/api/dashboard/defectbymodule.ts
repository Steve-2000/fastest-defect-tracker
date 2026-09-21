import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export const getDefectByModule = async (projectId: number | string) => {
  try {
    const r = await apiClient.get(ENDPOINTS.defectByModules(Number(projectId)));
    return r.data;
  } catch {
    return { data: [] };
  }
};

export const getDefectsByModule = getDefectByModule;
