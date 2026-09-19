import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";

const unwrap = (r: any) => r?.data?.data ?? r?.data;

const postAllocation = (releaseId: number, testCaseId: number | string) =>
    apiClient.post(ENDPOINTS.releaseTestCase(releaseId), {
        testCaseId: Number(testCaseId),
    });

export const getReleaseTestCases = async (releaseId: number) => {
    try {
        const r = await apiClient.get(ENDPOINTS.releaseTestCase(releaseId));
        return r.data?.data ?? r.data ?? [];
    } catch (error) {
        console.error(`Failed to fetch release test cases for release ${releaseId}:`, error);
        throw error;
    }
};

export const createReleaseTestCase = async (releaseId: number, data: any) => {
    const r = await apiClient.post(ENDPOINTS.releaseTestCase(releaseId), data);
    return r.data;
};

export const updateReleaseTestCase = async (releaseId: number, id: number, data: any) => {
    const r = await apiClient.put(ENDPOINTS.releaseTestCaseById(releaseId, id), data);
    return r.data;
};

export const deleteReleaseTestCase = async (releaseId: number, id: number) => {
    const r = await apiClient.delete(ENDPOINTS.releaseTestCaseById(releaseId, id));
    return r.data;
};

export const updateReleaseTestCaseStatus = async (releaseId: number, id: number, data: any) => {
    const r = await apiClient.patch(ENDPOINTS.releaseTestCaseStatus(releaseId, id), data);
    return r.data;
};

// Always returns an array, because handleAllocate checks Array.isArray(...)
export const allocateTestCaseToRelease = async (
    releaseId: number,
    testCaseId: number | string,
) => {
    const created = unwrap(await postAllocation(releaseId, testCaseId));
    return Array.isArray(created) ? created : [created ?? { testCaseId }];
};

// One test case -> many releases. Returns { results, failed }
export const allocateTestCaseToMultipleReleases = async (
    testCaseId: number | string,
    releaseIds: (number | string)[],
) => {
    const settled = await Promise.allSettled(
        releaseIds.map((id) => allocateTestCaseToRelease(Number(id), testCaseId)),
    );
    const results: any[] = [];
    const failed: { releaseId: number; error: string }[] = [];
    settled.forEach((s, i) => {
        if (s.status === "fulfilled") results.push(...s.value);
        else
            failed.push({
                releaseId: Number(releaseIds[i]),
                error: s.reason?.response?.data?.message || s.reason?.message || "Unknown error",
            });
    });
    return { results, failed };
};

// Many test cases -> one release. Returns the array of allocated items
export const bulkAllocateTestCasesToReleases = async (
    testCaseIds: (number | string)[],
    releaseId: number | string,
) => {
    const settled = await Promise.allSettled(
        testCaseIds.map((id) => allocateTestCaseToRelease(Number(releaseId), id)),
    );
    const ok = settled.flatMap((s) => (s.status === "fulfilled" ? s.value : []));
    if (ok.length === 0) {
        const rej = settled.find((s) => s.status === "rejected") as PromiseRejectedResult | undefined;
        if (rej) throw rej.reason;
    }
    return ok;
};

// Many -> many. Returns [{ status, releaseId, releaseName, data | error }]
export const allocateTestCasesToManyReleases = async (
    releaseIds: (number | string)[],
    releaseNames: string[],
    testCaseIds: (number | string)[],
) =>
    Promise.all(
        releaseIds.map(async (rid, i) => {
            try {
                const data = await bulkAllocateTestCasesToReleases(testCaseIds, rid);
                return { status: "fulfilled", releaseId: rid, releaseName: releaseNames[i], data };
            } catch (error) {
                return { status: "rejected", releaseId: rid, releaseName: releaseNames[i], error };
            }
        }),
    );

export const getReleaseTestCasesByFiltersGroup = async (releaseId: number, filters: any = {}) => {
    try {
        const r = await apiClient.get(ENDPOINTS.releaseTestCase(releaseId));
        return r.data?.data ?? r.data ?? [];
    } catch {
        return [];
    }
};

export const getQaAllocationSummary = async (releaseId: number) => {
    try {
        const r = await apiClient.get(ENDPOINTS.releaseTestCaseQaAllocation(releaseId));
        return r.data?.data ?? r.data ?? [];
    } catch {
        return [];
    }
};

export const getQaEngineerTestCases = async (releaseId: number, employeeId: number) => {
    try {
        const r = await apiClient.get(ENDPOINTS.releaseTestCaseEmployeePatch(releaseId, employeeId));
        return r.data?.data ?? r.data ?? [];
    } catch {
        return [];
    }
};

export const getDefectTestCaseCounts = async (releaseId: number) => {
    try {
        const r = await apiClient.get(ENDPOINTS.releaseTestCase(releaseId));
        const list = r.data?.data ?? r.data ?? [];
        return { total: list.length };
    } catch {
        return { total: 0 };
    }
};

export const getTestCasesByFilter = async (releaseId: number, filters: any = {}) => {
    return getReleaseTestCasesByFiltersGroup(releaseId, filters);
};
