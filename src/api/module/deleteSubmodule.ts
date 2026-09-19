import apiClient from "../../lib/api"; import { ENDPOINTS } from "../../utils/apiendpoint";
export const deleteSubmodule = async (mid, id) => { const r=await apiClient.delete(ENDPOINTS.subModuleById(mid,id)); return r.data; };
export default deleteSubmodule;
