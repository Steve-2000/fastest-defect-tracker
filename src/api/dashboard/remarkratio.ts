import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export const getDefectRemarkRatioByProjectId = async (projectId: number | string) => {
  try {
    const r = await apiClient.get(ENDPOINTS.defectDensity(Number(projectId)));
    return r.data;
  } catch {
    return { data: { ratio: "1:0", category: "low", color: "#22c55e" } };
  }
};
