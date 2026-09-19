import apiClient, { tokenManager } from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";

class AuthService {
  static async login(email, password) {
    this.clearAuthData();
    const response = await apiClient.post(ENDPOINTS.login, { email, password });
    const { token, refreshToken, ...userData } = response.data.data;
    tokenManager.setToken(token);
    tokenManager.setRefreshToken(refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    return response.data;
  }
  static async logout() {
    try { await apiClient.post(ENDPOINTS.logout); } catch {}
    finally { this.clearAuthData(); }
  }
  static clearAuthData() {
    tokenManager.removeToken();
    tokenManager.removeRefreshToken();
    localStorage.removeItem("user");
  }
  static logoutImmediate() { this.clearAuthData(); }
  static isAuthenticated() { const t = tokenManager.getToken(); return !!t && t.length > 0; }
  static getCurrentUser() {
    try { const s = localStorage.getItem("user"); return s ? JSON.parse(s) : null; } catch { return null; }
  }
  static getToken() { return tokenManager.getToken(); }
}
export default AuthService;
