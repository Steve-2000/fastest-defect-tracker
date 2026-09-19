import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const deleteRelease = async (id: number) => { const r = await apiClient.delete(ENDPOINTS.releaseById(id)); return r.data; };
export const deleteReleaseById = deleteRelease;
