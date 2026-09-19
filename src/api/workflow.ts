import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";
export const getWorkflow = async () => {
  try { const r = await apiClient.get(ENDPOINTS.workflow); return r.data.data ?? []; }
  catch { return []; }
};
export const getWorkflowById = async (id) => {
  try { const r = await apiClient.get(ENDPOINTS.workflowById(id)); return r.data.data ?? {}; }
  catch { return {}; }
};
export const getNextStatuses = async (statusId) => {
  try { const r = await apiClient.get(ENDPOINTS.workflowNextStatus(statusId)); return r.data.data ?? []; }
  catch { return []; }
};

export const saveWorkflow = async (data: any) => ({});
export const getAllWorkflows = async () => [];
