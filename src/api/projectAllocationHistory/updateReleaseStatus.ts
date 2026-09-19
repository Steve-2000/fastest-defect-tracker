import apiClient from '../../lib/api';
import { ENDPOINTS } from '../../utils/apiendpoint';

export const updateReleaseStatus = async (releaseId: number, status: string) => {
  const res = await apiClient.patch(ENDPOINTS.releaseStatus(releaseId), { status });
  return res.data;
};