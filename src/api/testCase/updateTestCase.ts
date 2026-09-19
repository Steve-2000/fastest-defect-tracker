import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const updateTestCase = async (subModuleId, id, data) => {
  const r = await apiClient.put(ENDPOINTS.testCaseById(subModuleId, id), data);
  return r.data;
};
export default updateTestCase;
