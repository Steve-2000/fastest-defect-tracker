import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getActiveReleases = async () => {
  try { const r = await apiClient.get(ENDPOINTS.release); return (r.data.data ?? r.data ?? []).filter(x => x.status === "ACTIVE"); }
  catch { return []; }
};
