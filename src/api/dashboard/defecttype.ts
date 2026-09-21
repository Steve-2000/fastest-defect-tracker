import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export const getDefectByType = async (projectId: number | string) => {
  try {
    const r = await apiClient.get(ENDPOINTS.defectByType(Number(projectId)));
    return r.data;
  } catch {
    return { data: { defectTypes: [], totalDefectCount: 0 } };
  }
};

export const getDefectTypeByProjectId = getDefectByType;
