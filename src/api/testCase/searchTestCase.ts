import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const searchTestCase = async (subModuleId, query="") => {
  try {
    const r = await apiClient.get(ENDPOINTS.testCaseBySubModule(subModuleId));
    const list = r.data.data ?? [];
    return list.filter(t => t.name?.toLowerCase().includes(query.toLowerCase()) || t.description?.toLowerCase().includes(query.toLowerCase()));
  } catch { return []; }
};
