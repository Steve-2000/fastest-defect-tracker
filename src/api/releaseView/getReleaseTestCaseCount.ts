import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getReleaseTestCaseCount = async (releaseId: number) => { try { const r = await apiClient.get(ENDPOINTS.releaseTestCase(releaseId)); const list=r.data.data??[]; return {total:list.length,passed:list.filter((t:any)=>t.status==="PASS").length,failed:list.filter((t:any)=>t.status==="FAIL").length}; } catch { return {total:0,passed:0,failed:0}; } };
export const getReleaseTestCaseCounts = getReleaseTestCaseCount;
