import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";

export const getWorkflow = async () => {
  try {
    const r = await apiClient.get(ENDPOINTS.workflow);
    return r.data;
  } catch {
    return { data: [] };
  }
};

export const getAllWorkflows = async () => {
  try {
    const r = await apiClient.get(ENDPOINTS.workflow);
    return r.data;
  } catch {
    return { data: [] };
  }
};

export const getWorkflowById = async (id: any) => {
  try {
    const r = await apiClient.get(ENDPOINTS.workflowById(id));
    return r.data.data ?? {};
  } catch {
    return {};
  }
};

export const getNextStatuses = async (statusId: any) => {
  try {
    const r = await apiClient.get(ENDPOINTS.workflowNextStatus(statusId));
    // Backend returns { data: [ { id, statusName, colorCode, toStatus: { id, name, color } } ] }
    return r.data;
  } catch {
    return { data: [] };
  }
};

export const getWorkflowStartStatus = async () => {
  try {
    const r = await apiClient.get("/api/v1/status/workflow/start");
    return r.data;
  } catch {
    return { data: null };
  }
};

export const saveWorkflow = async (data: any) => {
  try {
    const r = await apiClient.post(ENDPOINTS.workflow, data);
    return r.data;
  } catch (e) {
    throw e;
  }
};
