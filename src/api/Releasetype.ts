import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";
export const getAllReleaseTypes = async (page=0, size=100) => { const r = await apiClient.get(ENDPOINTS.releaseTypePagination(page,size)); const list=r.data.data??r.data??[]; return {status:"success",statusMessage:"ok",statusCode:200,data:{totalElements:list.length,content:list.map(x=>({id:x.id,releaseTypeName:x.name??x.releaseTypeName,name:x.name??x.releaseTypeName}))}}; };
export const createReleaseType = async (data) => { const r = await apiClient.post(ENDPOINTS.releaseType,{name:data.releaseTypeName}); return r.data.data??r.data; };
export const updateReleaseType = async (id, data) => { const r = await apiClient.put(ENDPOINTS.releaseTypeById(id),{name:data.releaseTypeName}); return r.data.data??r.data; };
export const deleteReleaseType = async (id) => { const r = await apiClient.delete(ENDPOINTS.releaseTypeById(id)); return r.data; };
