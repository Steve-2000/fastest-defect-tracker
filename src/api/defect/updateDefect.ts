import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const updateDefect = async (id: number, data: any) => { const r = await apiClient.put(ENDPOINTS.defectById(id),data); return r.data; };
export const updateDefectById = updateDefect;
export const updateDefectStatus = async (id: number, data: any) => { const r = await apiClient.patch(ENDPOINTS.defectStatus(id),data); return r.data; };
export default updateDefect;
