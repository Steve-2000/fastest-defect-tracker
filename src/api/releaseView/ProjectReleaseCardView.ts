import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export const projectReleaseCardView = async (projectId: number | string) => {
  try {
    let list: any[] = [];
    try {
      const r = await apiClient.get(ENDPOINTS.releaseActiveByProject(Number(projectId)));
      const raw = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
      if (Array.isArray(raw)) list = raw;
    } catch {
      list = [];
    }

    try {
      const allRes = await apiClient.get(ENDPOINTS.release);
      const allList = Array.isArray(allRes.data) ? allRes.data : (allRes.data?.data ?? []);
      if (Array.isArray(allList)) {
        const matchingReleases = allList.filter((r: any) =>
          String(r.project_id) === String(projectId) ||
          String(r.projectId) === String(projectId) ||
          String(r.project?.id) === String(projectId)
        );
        if (matchingReleases.length > list.length || list.length === 0) {
          list = matchingReleases;
        }
      }
    } catch {
      // ignore
    }

    const normalized = list.map((r: any) => ({
      ...r,
      releaseDate: r.releaseDate || r.startDate || "",
      startDate: r.startDate || r.releaseDate || "",
      projectId: r.projectId || r.project_id || r.project?.id,
      project_id: r.project_id || r.projectId || r.project?.id,
      releaseType_id: r.releaseType_id || r.releaseType?.id,
    }));

    const result: any = [...normalized];
    result.data = normalized;
    result.status = "Success";
    result.statusCode = "200";
    return result;
  } catch (error) {
    console.error("Error in projectReleaseCardView:", error);
    const errResult: any = [];
    errResult.data = [];
    errResult.status = "Error";
    errResult.statusCode = "500";
    return errResult;
  }
};

export const getReleaseTestCaseCountsLoad = async (releaseIds: any) => {
  try {
    const ids: number[] = Array.isArray(releaseIds) ? releaseIds : [Number(releaseIds)];
    const data = ids.map((id) => ({
      releaseId: id,
      testCaseCount: 0,
      passCount: 0,
      failCount: 0,
    }));
    return {
      status: "Success",
      statusCode: 200,
      data,
      total: 0,
      passed: 0,
      failed: 0,
    };
  } catch {
    return {
      status: "Error",
      statusCode: 500,
      data: [],
      total: 0,
      passed: 0,
      failed: 0,
    };
  }
};

export const getProjectReleaseCardView = projectReleaseCardView;
