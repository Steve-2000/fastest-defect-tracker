import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export async function getDesignations(page = 0, size = 100) {
  const r = await apiClient.get(ENDPOINTS.designationPagination(page, size));
  const rawList = r.data.data ?? r.data ?? [];
  const list = (Array.isArray(rawList) ? rawList : []).filter(
    (d: any) =>
      !d.isHidden &&
      !["admin", "administrator", "super admin", "system administrator"].includes(
        d.name?.toLowerCase().trim()
      )
  );
  return {
    status: "success",
    statusCode: 200,
    data: { content: list, totalElements: list.length, totalPages: 1, size, number: page },
  };
}
export const getAllDesignations = getDesignations;
export async function createDesignation(data) { const r = await apiClient.post(ENDPOINTS.designation,data); return r.data; }
export async function putDesignation(id, data) { const r = await apiClient.put(ENDPOINTS.designationById(id),data); return r.data; }
export const updateDesignation = putDesignation;
export async function deleteDesignation(id) { const r = await apiClient.delete(ENDPOINTS.designationById(id)); return r.data; }
