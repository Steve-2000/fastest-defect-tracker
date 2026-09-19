import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getBulkSubmoduleAllocation = async (moduleId) => {
  try { const r = await apiClient.get(ENDPOINTS.subModule(moduleId)); return r.data.data ?? []; }
  catch { return []; }
};

export const getBulkSuboduleAllocation = async (data: any) => [];
