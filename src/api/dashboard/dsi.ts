import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export const getDefectSeverityIndex = async (projectId: number | string) => {
  try {
    const r = await apiClient.get(ENDPOINTS.defectSeverityBreakdown(Number(projectId)));
    return r.data;
  } catch {
    return { data: { dsiPercentage: 1.0, dsiStatus: "Healthy" } };
  }
};
