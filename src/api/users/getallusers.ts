import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
function mapEmp(u: any) {
  const parts = (u.name ?? "").split(" ");
  const isAdminUser =
    u.role?.name === "Super Admin" ||
    u.role?.code === "SUPER_ADMIN" ||
    u.email === "admin@example.com" ||
    u.designation?.name === "Admin" ||
    u.designation?.isHidden ||
    u.designationName === "Admin";

  return {
    id: u.id,
    userId: String(u.id),
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    email: u.email,
    name: u.name,
    designationId: isAdminUser ? undefined : (u.designation?.id || u.designationId),
    designationName: isAdminUser ? "-" : (u.designation?.name || u.designationName || "-"),
    status: u.status,
    isActive: u.status === "ACTIVE",
    role: u.role,
    gender: u.gender || "-",
    contactNo: u.contactNo || "-",
    joinDate: u.joinDate || "-",
  };
}
export async function getAllUsers(page=0, size=100) { const r=await apiClient.get(ENDPOINTS.employee); const all=(r.data.data??r.data??[]).map(mapEmp); const s=page*size; return {status:"success",statusCode:200,data:{content:all.slice(s,s+size),totalElements:all.length,totalPages:Math.ceil(all.length/size),size,number:page}}; }
export async function getAllUsersSimple() { const r=await apiClient.get(ENDPOINTS.employee); return {status:"success",statusCode:200,data:(r.data.data??r.data??[]).map(mapEmp)}; }
export async function getUsersByDesignationId(desId) { const r=await apiClient.get(ENDPOINTS.designationEmployees(desId)); return {status:"success",data:(r.data.data??r.data??[]).map(mapEmp)}; }
export default getAllUsers;
