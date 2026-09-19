import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";
export const getAllDefectStatuses = async (page=0, size=100) => {
  const r = await apiClient.get(ENDPOINTS.statusTypePagination(page,size));
  const list = r.data?.data ?? r.data ?? [];
  return { content: list, data: list, totalPages: 1 };
};
export const createDefectStatus = async (data) => { const r = await apiClient.post(ENDPOINTS.statusType,data); return {status:"success",statusMessage:"Created",statusCode:200,data:{content:[r.data.data],totalPages:1}}; };
export const updateDefectStatus = async (id, data) => { const r = await apiClient.put(ENDPOINTS.statusTypeById(id),data); return {status:"success",statusMessage:"Updated",statusCode:200,data:{content:[r.data.data],totalPages:1}}; };
export const deleteDefectStatus = async (id) => { await apiClient.delete(ENDPOINTS.statusTypeById(id)); return {status:"success",statusMessage:"Deleted",statusCode:200,data:{content:[],totalPages:1}}; };
