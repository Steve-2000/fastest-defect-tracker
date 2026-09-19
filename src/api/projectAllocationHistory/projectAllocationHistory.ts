import apiClient from '../../lib/api';
import { ENDPOINTS } from '../../utils/apiendpoint';

export const getProjectAllocationHistory = async (projectId: number) => {
  const res = await apiClient.get(ENDPOINTS.projectAllocationProjectEmployeeHistory(projectId));
  return res.data.data ?? res.data ?? [];
};
