import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export interface BenchSearchParams {
  designation?: string;
  minAvailable?: number;
  skill?: string;
  page?: number;
  size?: number;
}

export const filterBench = async (params: BenchSearchParams = {}) => {
  try { const r = await apiClient.get(ENDPOINTS.benchEmployee); return r.data.data ?? r.data ?? []; }
  catch { return []; }
};

export default filterBench;
