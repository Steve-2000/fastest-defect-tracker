import apiClient from "../lib/api"; import { ENDPOINTS } from "../utils/apiendpoint";
export const getEmailConfig = async () => { try { const r=await apiClient.get(ENDPOINTS.emailConfig); return r.data.data??[]; } catch { return []; } };
export const createEmailConfig = async (data) => { const r=await apiClient.post(ENDPOINTS.emailConfig,data); return r.data; };
export const updateEmailConfig = async (id, data) => { const r=await apiClient.put(ENDPOINTS.emailConfigById(id),data); return r.data; };
export const enableEmailConfig = async (id) => { const r=await apiClient.patch(ENDPOINTS.emailConfigEnable(id),{}); return r.data; };
