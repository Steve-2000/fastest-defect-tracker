import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getCommentsByDefectId = async (defectId) => {
  try {
    const r = await apiClient.get(ENDPOINTS.defectComment(Number(defectId)));
    return { status:"success", statusCode:200, message:"Comments fetched", data: r.data.data ?? [] };
  } catch { return { status:"success", statusCode:200, message:"No comments", data: [] }; }
};
