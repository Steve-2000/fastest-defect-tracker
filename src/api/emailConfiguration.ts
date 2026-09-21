import apiClient from "../lib/api";

// ==========================================
// 1. TypeScript Interfaces & Types
// ==========================================

export type NotificationChannel = "EMAIL" | "WHATSAPP" | "BOTH" | "NONE";

export interface SmtpConfig {
  id: number;
  name: string;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password?: string;
  hasPassword?: boolean;
  fromEmail: string;
  fromName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSmtpConfigRequest {
  name: string;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password?: string;
  fromEmail?: string;
  fromName?: string;
  isActive?: boolean;
}

export interface UpdateSmtpConfigRequest {
  name: string;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password?: string;
  fromEmail?: string;
  fromName?: string;
  isActive?: boolean;
}

export interface TestConnectionRequest {
  id?: number;
  smtpHost?: string;
  smtpPort?: number;
  username?: string;
  password?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  latencyMs?: number;
}

export interface TestEmailRequest {
  id?: number;
  smtpHost?: string;
  smtpPort?: number;
  username?: string;
  password?: string;
  fromEmail?: string;
  fromName?: string;
  toEmail: string;
}

export interface TestEmailResponse {
  success: boolean;
  message: string;
  latencyMs?: number;
}

export interface EmailTemplate {
  id: number;
  eventKey: string;
  eventLabel: string;
  category: string;
  subject: string;
  bodyHtml: string;
  defaultSubject: string;
  defaultBodyHtml: string;
  variables: string[];
  isEnabled: boolean;
  isLocked: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateEmailTemplateRequest {
  subject: string;
  bodyHtml: string;
}

export interface TemplatePreviewRequest {
  templateId?: number;
  eventKey?: string;
  subject?: string;
  bodyHtml?: string;
  variables?: Record<string, string>;
}

export interface TemplatePreviewResponse {
  subject: string;
  bodyHtml: string;
  variablesUsed?: Record<string, string>;
}

export interface NotificationPoint {
  id: number;
  key: string;
  eventType: string;
  eventLabel: string;
  category: string;
  description: string;
  icon?: string;
  defaultSubject?: string;
  isEnabled: boolean;
  isConfigurable: boolean;
  isLocked: boolean;
  allowsExtraRecipients?: boolean;
  autoRecipientRole?: string;
  sortOrder?: number;
}

export interface RoleNotificationUpdateRequest {
  roleId: number;
  rules: Record<string, NotificationChannel | string>;
}

export interface NotificationLog {
  id: number;
  eventKey: string;
  recipientEmail?: string;
  recipientName?: string;
  channel: string;
  status: "SENT" | "FAILED" | "SKIPPED";
  errorMessage?: string;
  attemptCount: number;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}

// ==========================================
// 2. SMTP Server API
// ==========================================

export const getSmtpConfigs = async (): Promise<SmtpConfig[]> => {
  try {
    const res = await apiClient.get("/api/v1/email-config");
    return res.data?.data ?? [];
  } catch (error) {
    console.error("Failed to fetch SMTP configs:", error);
    return [];
  }
};

export const createSmtpConfig = async (data: CreateSmtpConfigRequest): Promise<SmtpConfig> => {
  const res = await apiClient.post("/api/v1/email-config", data);
  return res.data?.data;
};

export const updateSmtpConfig = async (id: number, data: UpdateSmtpConfigRequest): Promise<SmtpConfig> => {
  const res = await apiClient.put(`/api/v1/email-config/${id}`, data);
  return res.data?.data;
};

export const deleteSmtpConfig = async (id: number): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/api/v1/email-config/${id}`);
  return res.data;
};

export const toggleSmtpActive = async (id: number, active: boolean): Promise<SmtpConfig> => {
  const res = await apiClient.patch(`/api/v1/email-config/${id}/active?active=${active}`);
  return res.data?.data;
};

export const testSmtpConnection = async (data: TestConnectionRequest): Promise<TestConnectionResponse> => {
  const res = await apiClient.post("/api/v1/email-config/test-connection", data);
  return res.data?.data;
};

export const sendTestEmail = async (data: TestEmailRequest): Promise<TestEmailResponse> => {
  const res = await apiClient.post("/api/v1/email-config/test-email", data);
  return res.data?.data;
};

// ==========================================
// 3. Email Templates API
// ==========================================

export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  try {
    const res = await apiClient.get("/api/v1/email/templates");
    return res.data?.data ?? [];
  } catch (error) {
    console.error("Failed to fetch email templates:", error);
    return [];
  }
};

export const getEmailTemplateById = async (id: number): Promise<EmailTemplate> => {
  const res = await apiClient.get(`/api/v1/email/templates/${id}`);
  return res.data?.data;
};

export const updateEmailTemplate = async (id: number, data: UpdateEmailTemplateRequest): Promise<EmailTemplate> => {
  const res = await apiClient.put(`/api/v1/email/templates/${id}`, data);
  return res.data?.data;
};

export const resetEmailTemplate = async (id: number): Promise<EmailTemplate> => {
  const res = await apiClient.post(`/api/v1/email/templates/${id}/reset`);
  return res.data?.data;
};

export const toggleEmailTemplate = async (id: number, enabled: boolean): Promise<EmailTemplate> => {
  const res = await apiClient.patch(`/api/v1/email/templates/${id}/enable?enabled=${enabled}`);
  return res.data?.data;
};

export const reorderEmailTemplates = async (templateIds: number[]): Promise<void> => {
  await apiClient.post("/api/v1/email/templates/reorder", { templateIds });
};

export const getTemplateVariables = async (): Promise<Record<string, string[]>> => {
  try {
    const res = await apiClient.get("/api/v1/email/templates/variables");
    return res.data?.data ?? {};
  } catch (error) {
    console.error("Failed to fetch template variables:", error);
    return {};
  }
};

export const previewEmailTemplate = async (data: TemplatePreviewRequest): Promise<TemplatePreviewResponse> => {
  const res = await apiClient.post("/api/v1/email/templates/preview", data);
  return res.data?.data;
};

// ==========================================
// 4. Notification Points & Setup API
// ==========================================

export const getNotificationPoints = async (): Promise<NotificationPoint[]> => {
  try {
    const res = await apiClient.get("/api/v1/email/point-setup");
    return res.data?.data ?? [];
  } catch (error) {
    console.error("Failed to fetch notification points:", error);
    return [];
  }
};

// ==========================================
// 5. Role Notification Rules API
// ==========================================

export const getRoleAssignedPoints = async (roleId: number): Promise<Record<string, string>> => {
  try {
    const res = await apiClient.get(`/api/v1/role/${roleId}/assigned-points`);
    return res.data?.data ?? {};
  } catch (error) {
    console.error(`Failed to fetch assigned points for role ${roleId}:`, error);
    return {};
  }
};

export const updateRoleNotificationRules = async (data: RoleNotificationUpdateRequest): Promise<void> => {
  await apiClient.post("/api/v1/role-notifications/update", data);
};

// ==========================================
// 6. User Notification Preferences API
// ==========================================

export const getUserNotificationPreferences = async (userId: number): Promise<Record<string, string>> => {
  try {
    const res = await apiClient.get(`/api/v1/user/${userId}/extra-points`);
    return res.data?.data ?? {};
  } catch (error) {
    console.error(`Failed to fetch notification preferences for user ${userId}:`, error);
    return {};
  }
};

export const updateUserNotificationPreferences = async (
  userId: number,
  preferences: Record<string, string>
): Promise<void> => {
  await apiClient.post(`/api/v1/user/${userId}/extra-points`, preferences);
};

// ==========================================
// 7. Notification Logs & Audit API
// ==========================================

export const getNotificationLogs = async (
  page: number = 0,
  size: number = 20,
  eventKey?: string,
  status?: string
): Promise<PageResponse<NotificationLog>> => {
  try {
    const params: Record<string, any> = { page, size };
    if (eventKey) params.eventKey = eventKey;
    if (status) params.status = status;
    const res = await apiClient.get("/api/v1/email/logs", { params });
    return res.data?.data ?? { content: [], totalElements: 0, totalPages: 0, size, number: page };
  } catch (error) {
    console.error("Failed to fetch notification logs:", error);
    return { content: [], totalElements: 0, totalPages: 0, size, number: page };
  }
};

export const triggerTestDispatch = async (
  eventKey: string,
  contextPayload: Record<string, any>
): Promise<string> => {
  const res = await apiClient.post("/api/v1/email/dispatch-test", { eventKey, contextPayload });
  return res.data?.message || res.data?.data || "Dispatched successfully";
};
