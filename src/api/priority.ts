import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";
export interface Priority { id: number; name: string; color?: string; level?: number; }
export const getPriorities = async (page=0, size=100) => { const r = await apiClient.get(ENDPOINTS.priorityPagination(page,size)); const list: Priority[]=r.data.data??r.data??[]; return {status:"success",data:{content:list,totalElements:list.length,totalPages:1,size,number:page}}; };
export const getAllPriorities = async (page: number = 0, size: number = 100) => {
  const r = await apiClient.get(ENDPOINTS.priority, { params: { page, size } });
  const rawList = Array.isArray(r.data?.data)
    ? r.data.data
    : Array.isArray(r.data?.content)
    ? r.data.content
    : Array.isArray(r.data)
    ? r.data
    : [];

  return {
    ...r,
    data: {
      ...r.data,
      data: rawList,
      content: rawList,
      totalElements: rawList.length,
      totalPages: Math.max(1, Math.ceil(rawList.length / (size || 10))),
      size,
      number: page,
    },
  };
};
export const createPriority = async (data: Partial<Priority>) => { const r = await apiClient.post(ENDPOINTS.priority,data); return r.data; };
export const updatePriority = async (id: number, data: Partial<Priority>) => { const r = await apiClient.put(ENDPOINTS.priorityById(id),data); return r.data; };
export const deletePriority = async (id: number) => { const r = await apiClient.delete(ENDPOINTS.priorityById(id)); return r.data; };

