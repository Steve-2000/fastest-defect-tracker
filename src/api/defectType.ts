import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";
export const getDefectTypes = async (page: number = 0, size: number = 100) => {
  const r = await apiClient.get(ENDPOINTS.defectType, { params: { page, size } });
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
export const createDefectType = async (data: any) => { const r = await apiClient.post(ENDPOINTS.defectType, data); return r; };
export const updateDefectType = async (id: number, data: any) => { const r = await apiClient.put(ENDPOINTS.defectTypeById(id), data); return r.data; };
export const deleteDefectType = async (id: number) => { const r = await apiClient.delete(ENDPOINTS.defectTypeById(id)); return r.data; };
