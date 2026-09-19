import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";
export const getAllRoles = async (page=0, size=100) => { const r = await apiClient.get(ENDPOINTS.rolePagination(page,size)); const list=r.data.data??r.data??[]; return {status:"success",message:"ok",data:{content:list,totalElements:list.length,totalPages:1,pageNumber:page,pageSize:size}}; };
