import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

/** Returns true if the employee record belongs to an admin/super-admin account that should be hidden. */
function isAdminUser(u: any): boolean {
  const roleName = (u.role?.name ?? u.roleName ?? "").toLowerCase();
  const roleType = (u.role?.type ?? u.roleType ?? u.role?.code ?? "").toLowerCase();
  const desigName = (u.designation?.name ?? u.designationName ?? "").toLowerCase();
  return (
    roleType === "super_admin" ||
    roleName === "admin" ||
    roleName === "super admin" ||
    roleName === "administrator" ||
    desigName === "admin" ||
    Boolean(u.designation?.isHidden)
  );
}

function mapEmp(u: any) {
  const parts = (u.name ?? "").split(" ");
  return {
    id: u.id,
    userId: String(u.id),
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    email: u.email,
    name: u.name,
    designationId: u.designation?.id || u.designationId,
    designationName: u.designation?.name || u.designationName || "-",
    status: u.status,
    isActive: u.status === "ACTIVE",
    role: u.role,
    gender: u.gender || "-",
    contactNo: u.contactNo || "-",
    joinDate: u.joinDate || "-",
  };
}

export async function getAllUsers(page=0, size=100) { const r=await apiClient.get(ENDPOINTS.employee); const all=(r.data.data??r.data??[]).filter((u:any)=>!isAdminUser(u)).map(mapEmp); const s=page*size; return {status:"success",statusCode:200,data:{content:all.slice(s,s+size),totalElements:all.length,totalPages:Math.ceil(all.length/size),size,number:page}}; }
export async function getAllUsersSimple() { const r=await apiClient.get(ENDPOINTS.employee); return {status:"success",statusCode:200,data:(r.data.data??r.data??[]).filter((u:any)=>!isAdminUser(u)).map(mapEmp)}; }
export async function getUsersByDesignationId(desId: any) { const r=await apiClient.get(ENDPOINTS.designationEmployees(desId)); return {status:"success",data:(r.data.data??r.data??[]).filter((u:any)=>!isAdminUser(u)).map(mapEmp)}; }
export default getAllUsers;
