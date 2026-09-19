import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getQAAllocationFilter = async (releaseId: number) => { try { const r = await apiClient.get(ENDPOINTS.releaseTestCaseQaAllocation(releaseId)); return r.data.data??[]; } catch { return []; } };
export const allocated_testcases = async (releaseId: number) => { try { const r = await apiClient.get(ENDPOINTS.releaseTestCaseQaAllocation(releaseId)); return r.data.data??[]; } catch { return []; } };
export const allocated_testcase_details = async (releaseId: number, id: number) => { try { const r = await apiClient.get(ENDPOINTS.releaseTestCaseById(releaseId,id)); return r.data.data??{}; } catch { return {}; } };
export const bulkAssignOwner = async (data: any) => { const r = await apiClient.post(ENDPOINTS.releaseTestCaseQaAllocation(data.releaseId??0),data); return r.data; };
export const getAllocatedTestCases = allocated_testcases;
