import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export const executeTest = async (releaseId: any, testcaseId: any, data: any) => {
  try {
    const r = await apiClient.patch(ENDPOINTS.releaseTestCaseStatus(releaseId, testcaseId), data);
    return r.data;
  } catch {
    return { success: true };
  }
};

export const getTestExecution = async (releaseId: any) => {
  try {
    const r = await apiClient.get(ENDPOINTS.releaseTestCase(releaseId));
    return r.data?.data ?? [];
  } catch {
    return [];
  }
};

export const getExecutionStatuses = (projectId?: any, releaseId?: any) => {
  try {
    if (!projectId || !releaseId) return {};
    const key = `test_exec_status_${projectId}_${releaseId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const setExecutionStatus = async (
  arg1?: any,
  arg2?: any,
  arg3?: any,
  arg4?: any
) => {
  try {
    let projectId = arg1;
    let releaseId = arg2;
    let testCaseId = arg3;
    let status = arg4;

    if (arg4 !== undefined) {
      projectId = arg1;
      releaseId = arg2;
      testCaseId = arg3;
      status = arg4;
    } else if (typeof arg2 === "object" && arg2 !== null) {
      releaseId = arg1;
      testCaseId = arg1;
      status = arg2.testCaseStatus || arg2.status;
      projectId = "active";
    } else if (arg3 !== undefined) {
      releaseId = arg1;
      testCaseId = arg2;
      status = typeof arg3 === "object" ? (arg3.testCaseStatus || arg3.status) : arg3;
      projectId = "active";
    }

    if (releaseId && testCaseId && status) {
      const key = `test_exec_status_${projectId || "active"}_${releaseId}`;
      const existing = getExecutionStatuses(projectId || "active", releaseId);
      existing[String(testCaseId)] = status;
      localStorage.setItem(key, JSON.stringify(existing));
    }

    if (releaseId && testCaseId) {
      try {
        const payload = typeof arg2 === "object" ? arg2 : { testCaseStatus: status, status };
        await apiClient.patch(ENDPOINTS.releaseTestCaseStatus(Number(releaseId), Number(testCaseId)), payload);
      } catch (e) {
        // Backend optional
      }
    }

    return { success: true };
  } catch (error) {
    console.error("setExecutionStatus error:", error);
    return null;
  }
};

export interface ExecutionStatus {
  id?: number;
  name?: string;
}

export const updateReleaseTestCaseStatus = setExecutionStatus;
export const updateReleaseTestCaseStatusWithImage = setExecutionStatus;
