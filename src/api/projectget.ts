import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";
export const getAllProjects = async () => { const r = await apiClient.get(ENDPOINTS.project); return r.data.data ?? r.data ?? []; };
export const getAllProjectsForDashbord = async () => { const r = await apiClient.get(ENDPOINTS.project); return r.data; };
export async function updateProject(id, data) { const r = await apiClient.put(ENDPOINTS.projectById(Number(id)), data); return r.data; }
export async function deleteProject(id) { const r = await apiClient.delete(ENDPOINTS.projectById(Number(id))); return r.data; }
export async function createProject(data) { const r = await apiClient.post(ENDPOINTS.project, data); return r.data; }
export const getAvailableManagers = async (designationId) => {
  const url = designationId ? ENDPOINTS.availableManagers(designationId) : ENDPOINTS.employee;
  const r = await apiClient.get(url);
  const list = r.data.data ?? r.data ?? [];
  return list.map(u => ({ employeeId: u.id, firstName: u.name?.split(" ")[0]??u.name, lastName: u.name?.split(" ").slice(1).join(" ")??"", email: u.email, designationId: u.designationId||1, designationName: u.designationName||"", availabilityPercent: 100, isActive: u.status==="ACTIVE" }));
};
export const getAvailableManagersForUpdate = async (designationId, _pid) => getAvailableManagers(designationId);
