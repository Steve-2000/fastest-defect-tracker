import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export interface CalculateKlocRequest {
  backendRepo?: string;
  frontendRepo?: string;
  githubUsername?: string;
  githubToken?: string;
  releaseId?: number;
}

export const putKLOC = async (id: number, data: any) => {
  const payload = typeof data === 'number' ? { kloc: data } : data;
  const r = await apiClient.put(ENDPOINTS.releaseKlocById(id), payload);
  return r.data;
};

export const updateProjectKloc = async (projectId: number, data: any) => {
  const payload = typeof data === 'number' ? { kloc: data } : data;
  const r = await apiClient.put(ENDPOINTS.projectKloc(projectId), payload);
  return r.data;
};

export const calculateKlocFromGithub = async (data: CalculateKlocRequest) => {
  try {
    const r = await apiClient.post(ENDPOINTS.gitKloc, data);
    return r.data;
  } catch {
    return { data: { totalKLOC: 0 } };
  }
};
