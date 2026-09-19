import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const createComment = async (defectId: number | string, data: any) => { const r = await apiClient.post(ENDPOINTS.defectComment(Number(defectId)),data); return r.data; };
export const updateComment = async (defectId: number | string, id: number, data: any) => { const r = await apiClient.put(ENDPOINTS.defectComment(Number(defectId)),data); return r.data; };
