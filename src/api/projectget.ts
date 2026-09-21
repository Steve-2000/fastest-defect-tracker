import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";
export const getAllProjects = async () => { const r = await apiClient.get(ENDPOINTS.project); return r.data.data ?? r.data ?? []; };
export const getAllProjectsForDashbord = async () => { const r = await apiClient.get(ENDPOINTS.project); return r.data; };
export async function updateProject(id, data) { const r = await apiClient.put(ENDPOINTS.projectById(Number(id)), data); return r.data; }
export async function deleteProject(id) { const r = await apiClient.delete(ENDPOINTS.projectById(Number(id))); return r.data; }
export async function createProject(data) { const r = await apiClient.post(ENDPOINTS.project, data); return r.data; }
export const getAvailableManagers = async (designationId?: number | string) => {
  const url = designationId ? ENDPOINTS.availableManagers(Number(designationId)) : ENDPOINTS.employee;
  const r = await apiClient.get(url);
  const list = r.data.data ?? r.data ?? [];
  return list.map((u: any) => ({
    employeeId: u.id,
    firstName: u.name?.split(" ")[0] ?? u.name,
    lastName: u.name?.split(" ").slice(1).join(" ") ?? "",
    email: u.email,
    designationId: u.designation?.id ?? u.designationId ?? 1,
    designationName: u.designation?.name ?? u.designationName ?? "",
    availabilityPercent: 100,
    isActive: u.status === "ACTIVE"
  }));
};
export const getAvailableManagersForUpdate = async (designationId?: number | string, pid?: number | string) => {
  const url = designationId && pid
    ? ENDPOINTS.availableManagersForUpdate(Number(designationId), Number(pid))
    : designationId
      ? ENDPOINTS.availableManagers(Number(designationId))
      : ENDPOINTS.employee;
  const r = await apiClient.get(url);
  const list = r.data.data ?? r.data ?? [];
  return list.map((u: any) => ({
    employeeId: u.id,
    firstName: u.name?.split(" ")[0] ?? u.name,
    lastName: u.name?.split(" ").slice(1).join(" ") ?? "",
    email: u.email,
    designationId: u.designation?.id ?? u.designationId ?? 1,
    designationName: u.designation?.name ?? u.designationName ?? "",
    availabilityPercent: 100,
    isActive: u.status === "ACTIVE"
  }));
};
