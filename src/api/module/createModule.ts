import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const createModule = async (projectId: number, data: any) => { const r = await apiClient.post(ENDPOINTS.module(projectId),data); return r.data; };
export const createSubmodule = async (moduleId: number, data: any) => { const r = await apiClient.post(ENDPOINTS.subModule(moduleId),data); return r.data; };
