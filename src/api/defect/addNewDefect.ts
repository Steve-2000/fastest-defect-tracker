import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const addNewDefect = async (data: any) => { const r = await apiClient.post(ENDPOINTS.defect, data); return r.data; };
export const addDefects = addNewDefect;
export default addNewDefect;
