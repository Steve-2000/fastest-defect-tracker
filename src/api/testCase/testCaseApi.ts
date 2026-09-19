import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getTestCases = async (subModuleId: number) => {
  try {
    const r = await apiClient.get(ENDPOINTS.testCaseBySubModule(subModuleId));
    return r.data?.data ?? r.data ?? [];
  } catch {
    return [];
  }
};

export const deleteTestCase = async (subModuleId: number, id: number) => {
  const r = await apiClient.delete(ENDPOINTS.testCaseById(subModuleId, id));
  return r.data;
};

export const getTestCasesByBulkModules = async (moduleIds: number[]) => {
  try {
    const r = await apiClient.post(ENDPOINTS.testCaseBulkAll, { moduleIds });
    return r.data?.data ?? r.data ?? [];
  } catch {
    return [];
  }
};

export const getTestCasesByBulkSubmodules = async (subModuleIds: number[]) => {
  try {
    const r = await apiClient.post(ENDPOINTS.testCaseBulkAll, { subModuleIds });
    return r.data?.data ?? r.data ?? [];
  } catch {
    return [];
  }
};

export const getTestCasesByProjectAndSubmodule = async (
  projectId: number | string,
  subModuleId: number | string,
  description?: string,
  defectTypeId?: number,
  severityId?: number,
  page?: number,
  size?: number
) => {
  try {
    const r = await apiClient.get(
      ENDPOINTS.testCaseBySubModule(
        Number(subModuleId),
        description,
        defectTypeId,
        severityId,
        page,
        size
      )
    );
    const data = r.data?.data ?? r.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const getTestCasesByProjectAndModule = async (
  projectId: number | string,
  moduleId: number | string,
  subModuleIds?: (number | string)[],
  page?: number,
  size?: number
) => {
  try {
    const r = await apiClient.get(ENDPOINTS.testCaseByModule(Number(moduleId)), {
      params: { page, size },
    });
    const data = r.data?.data ?? r.data ?? [];
    if (Array.isArray(data)) return data;
  } catch { }

  if (subModuleIds && subModuleIds.length > 0) {
    try {
      const results = await Promise.all(
        subModuleIds.map((id) => getTestCases(Number(id)))
      );
      return results.flat();
    } catch {
      return [];
    }
  }

  return [];
};

export const getTestCasesByProject = async (
  projectId: number | string,
  subModuleIds?: (number | string)[]
) => {
  try {
    const r = await apiClient.get(ENDPOINTS.testCaseByProject(projectId));
    const data = r.data?.data ?? r.data ?? [];
    if (Array.isArray(data)) return data;
  } catch { }

  if (subModuleIds && subModuleIds.length > 0) {
    try {
      const results = await Promise.all(
        subModuleIds.map((id) => getTestCases(Number(id)))
      );
      return results.flat();
    } catch {
      return [];
    }
  }

  return [];
};

