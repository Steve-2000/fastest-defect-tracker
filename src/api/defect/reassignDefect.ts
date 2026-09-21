import apiClient from '../../lib/api';

export interface BulkReassignPayload {
  defectIds: number[];
  assignedToId: number;
}

export const bulkReassignDefectsApi = async (defectIds: number[], assignedToId: number) => {
  const response = await apiClient.post('/api/v1/defect/bulk-reassign', {
    defectIds,
    assignedToId,
  });
  return response.data;
};

export default bulkReassignDefectsApi;
