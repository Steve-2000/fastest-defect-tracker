import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";
export const getSeverities = async (page=0, size=100) => { const r = await apiClient.get(ENDPOINTS.severityPagination(page,size)); const list=r.data.data??r.data??[]; return {status:"success",message:"ok",data:{content:list,totalElements:list.length,totalPages:1,size,number:page}}; };
export const createSeverity = async (data) => { const r = await apiClient.post(ENDPOINTS.severity,data); return {status:"success",message:"Created",statusCode:200,data:r.data.data}; };
export const updateSeverity = async (id, data) => { const r = await apiClient.put(ENDPOINTS.severityById(id),data); return {status:"success",message:"Updated",statusCode:200,data:r.data.data}; };
export const deleteSeverity = async (id) => { const r = await apiClient.delete(ENDPOINTS.severityById(id)); return r.data; };
