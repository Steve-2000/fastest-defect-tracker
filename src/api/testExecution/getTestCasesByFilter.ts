import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
import { getSubmodulesByModule } from "../submodule/getSubmodulesByModule";

export const getTestCasesByFilter = async (arg1: any, arg2: any = {}) => {
  try {
    let subModuleId: any = null;
    let moduleId: any = null;
    let projectId: any = null;

    let releaseId: any = null;

    if (typeof arg1 === "object" && arg1 !== null) {
      subModuleId = arg1.subModuleId || arg1.submoduleId;
      moduleId = arg1.moduleId;
      projectId = arg1.projectId;
      releaseId = arg1.releaseId;
    } else {
      subModuleId = arg1;
      if (typeof arg2 === "object" && arg2 !== null) {
        moduleId = arg2.moduleId;
        projectId = arg2.projectId;
        releaseId = arg2.releaseId;
      }
    }

    if (releaseId) {
      try {
        const r = await apiClient.get(ENDPOINTS.releaseTestCase(Number(releaseId)));
        let list = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
        if (moduleId) {
          list = list.filter((tc: any) => String(tc.moduleId ?? tc.module?.id) === String(moduleId));
        }
        if (subModuleId) {
          list = list.filter((tc: any) => String(tc.subModuleId ?? tc.submoduleId ?? tc.submodule?.id) === String(subModuleId));
        }
        return list;
      } catch (e) {
        console.warn("Failed to fetch test cases by release:", e);
      }
    }

    if (subModuleId) {
      const r = await apiClient.get(ENDPOINTS.testCaseBySubModule(Number(subModuleId)));
      const list = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
      return list;
    }

    if (moduleId) {
      // Fetch submodules of this module and then their test cases
      const subRes = await getSubmodulesByModule(Number(moduleId));
      const submodules = Array.isArray(subRes) ? subRes : (subRes?.data ?? []);
      const testCasePromises = submodules.map(async (sub: any) => {
        try {
          const r = await apiClient.get(ENDPOINTS.testCaseBySubModule(Number(sub.id)));
          return Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
        } catch {
          return [];
        }
      });
      const results = await Promise.all(testCasePromises);
      return results.flat();
    }

    return [];
  } catch (error) {
    console.error("Error in getTestCasesByFilter:", error);
    return [];
  }
};
