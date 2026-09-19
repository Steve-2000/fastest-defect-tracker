import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const deleteDefect = async (id: number) => { const r = await apiClient.delete(ENDPOINTS.defectById(id)); return r.data; };
export const deleteDefectById = deleteDefect;
export default deleteDefect;
