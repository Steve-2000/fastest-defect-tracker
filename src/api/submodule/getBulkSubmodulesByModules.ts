import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export interface BulkSubmodule { id: number; name: string; moduleId: number; }
export const getBulkSubmodulesByModules = async (moduleIds: number[]) => { try { const r = await apiClient.post(ENDPOINTS.subModuleBulk(),{moduleIds}); return r.data.data??[]; } catch { return []; } };
