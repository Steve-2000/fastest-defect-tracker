import apiClient from "../../lib/api"; import { ENDPOINTS } from "../../utils/apiendpoint";
export const updateSubmodule = async (mid, id, data) => { const r=await apiClient.put(ENDPOINTS.subModuleById(mid,id),data); return r.data; };
export default updateSubmodule;
