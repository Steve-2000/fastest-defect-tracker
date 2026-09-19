import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export interface QAMember { id: number; name: string; email?: string; }
export const assignQA = async (releaseId: number, testcaseId: number, data: any) => { const r = await apiClient.post(ENDPOINTS.releaseTestCaseQaAssign(releaseId,testcaseId),data); return r.data; };
export const getQAAllocation = async (releaseId: number) => { try { const r = await apiClient.get(ENDPOINTS.releaseTestCaseQaAllocation(releaseId)); return r.data.data??[]; } catch { return []; } };
export const getQAMembersByProjectId = async (projectId: number) => { try { const r = await apiClient.get(ENDPOINTS.GET_PROJECT_ALLOCATED_EMPLOYEES(projectId)); return r.data.data??[]; } catch { return []; } };
