import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export interface CreateTestCaseRequest {
  name?: string;
  description: string;
  detailsSteps?: string;
  steps?: string;
  severityId?: number;
  defectTypeId?: number;
}

export const createTestCase = async (subModuleId: number | string, data: any) => {
  const r = await apiClient.post(ENDPOINTS.testCaseBySubModule(Number(subModuleId)), data);
  return r.data;
};
export default createTestCase;

export const createTestCaseSub = createTestCase;
