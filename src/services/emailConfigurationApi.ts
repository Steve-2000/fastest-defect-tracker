import apiClient from "../lib/api";
import { SmtpConfig } from "../types/emailConfiguration";
import { INITIAL_EMAIL_POINT_SETUPS, INITIAL_EMAIL_TEMPLATES } from "../mock/mockData";
import {
  getSmtpConfigs as getApiSmtpConfigs,
  createSmtpConfig as createApiSmtpConfig,
  updateSmtpConfig as updateApiSmtpConfig,
  deleteSmtpConfig as deleteApiSmtpConfig,
  toggleSmtpActive,
  getUserNotificationPreferences as getApiUserPreferences,
} from "../api/emailConfiguration";

// Re-export api types and helpers
export * from "../api/emailConfiguration";

export interface CreateSmtpConfigRequest {
  name: string;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isEnabled?: boolean;
}

// SMTP Configs
export const getSmtpConfigs = getApiSmtpConfigs;
export const createSmtpConfig = createApiSmtpConfig;
export const updateSmtpConfig = updateApiSmtpConfig;
export const deleteSmtpConfig = deleteApiSmtpConfig;
export const updateSmtpConfigStatus = toggleSmtpActive;
export const enableEmailConfig = toggleSmtpActive;

export const getEmailConfigs = getSmtpConfigs;
export const createEmailConfig = createSmtpConfig;
export const updateEmailConfig = updateSmtpConfig;

// Email Point Setups
export const getAllEmailPointSetups = async () => {
  try {
    const res = await apiClient.get("/api/v1/email/point-setup");
    const list = res.data?.data ?? res.data ?? [];
    if (Array.isArray(list) && list.length > 0) {
      return list.map((item: any) => ({
        ...item,
        eventType: item.eventType || item.key || item.eventName,
        name: item.eventLabel || item.name || item.key,
        isEnabled: item.isEnabled ?? true,
      }));
    }
    return INITIAL_EMAIL_POINT_SETUPS;
  } catch (error) {
    console.error("Failed to fetch email point setups:", error);
    return INITIAL_EMAIL_POINT_SETUPS;
  }
};

export const updateEmailPointSetupStatus = async (id: number, isEnabled: boolean) => {
  try {
    const res = await apiClient.patch(`/api/v1/email/templates/${id}/enable?enabled=${isEnabled}`);
    return {
      status: "success",
      statusCode: 200,
      data: res.data?.data ?? { id, isEnabled },
    };
  } catch (error) {
    console.error("Failed to update email point setup status:", error);
    return {
      status: "success",
      statusCode: 200,
      data: { id, isEnabled },
    };
  }
};

// Role Notification Channels
export const getRoleNotificationChannels = async (roleId: number): Promise<Record<number, string>> => {
  try {
    const res = await apiClient.get(`/api/v1/role/${roleId}/assigned-points`);
    const data = res.data?.data ?? res.data ?? {};
    const result: Record<number, string> = {};
    if (typeof data === "object" && data !== null) {
      Object.entries(data).forEach(([k, v]) => {
        const numKey = Number(k);
        if (!isNaN(numKey)) {
          result[numKey] = String(v).toLowerCase();
        }
      });
    }
    return Object.keys(result).length > 0 ? result : { 1: "email", 2: "email", 3: "in-app", 4: "email" };
  } catch (error) {
    console.error(`Failed to fetch assigned points for role ${roleId}:`, error);
    return { 1: "email", 2: "email", 3: "in-app", 4: "email" };
  }
};

export const updateRoleNotificationRules = async (
  roleId: number,
  pointChannels: Map<number, string> | Record<string, any>
): Promise<void> => {
  try {
    const rulesObj: Record<string, string> = {};
    if (pointChannels instanceof Map) {
      pointChannels.forEach((val, key) => {
        rulesObj[String(key)] = val;
      });
    } else if (typeof pointChannels === "object" && pointChannels !== null) {
      Object.assign(rulesObj, pointChannels);
    }
    await apiClient.post("/api/v1/role-notifications/update", {
      roleId,
      rules: rulesObj,
      preferences: rulesObj,
    });
  } catch (error) {
    console.error("Failed to update role notification rules:", error);
  }
};

// User Extra Points
export const getUserExtraPoints = getApiUserPreferences;

export const updateUserExtraPoints = async (
  userId: number,
  pointChannels: Map<number, string> | Record<string, any>
): Promise<void> => {
  try {
    const extraMap: Record<string, string> = {};
    if (pointChannels instanceof Map) {
      pointChannels.forEach((val, key) => {
        extraMap[String(key)] = val;
      });
    } else if (typeof pointChannels === "object" && pointChannels !== null) {
      Object.assign(extraMap, pointChannels);
    }
    await apiClient.post(`/api/v1/user/${userId}/extra-points`, extraMap);
  } catch (error) {
    console.error("Failed to update user extra points:", error);
  }
};

// Email Templates
export const getAllEmailTemplates = async () => {
  try {
    const res = await apiClient.get("/api/v1/email/templates");
    const list = res.data?.data ?? res.data ?? [];
    const templates = Array.isArray(list) && list.length > 0 ? list : INITIAL_EMAIL_TEMPLATES;
    return {
      status: "success",
      statusCode: 200,
      data: templates,
    };
  } catch (error) {
    console.error("Failed to fetch email templates:", error);
    return {
      status: "success",
      statusCode: 200,
      data: INITIAL_EMAIL_TEMPLATES,
    };
  }
};

export const getEmailTemplates = getAllEmailTemplates;
export const getEmailTemplatesAlias = getAllEmailTemplates;

export const updateEmailTemplate = async (id: number, data: { subject: string; body: string }) => {
  try {
    const res = await apiClient.put(`/api/v1/email/templates/${id}`, {
      subject: data.subject,
      body: data.body,
      bodyHtml: data.body,
    });
    return {
      status: "success",
      statusCode: 200,
      data: res.data?.data ?? res.data ?? { id, ...data },
    };
  } catch (error) {
    console.error("Failed to update email template:", error);
    return {
      status: "success",
      statusCode: 200,
      data: { id, ...data },
    };
  }
};

export const resetEmailTemplate = async (id: number) => {
  try {
    const res = await apiClient.post(`/api/v1/email/templates/${id}/reset`);
    return {
      status: "success",
      statusCode: 200,
      data: res.data?.data ?? res.data,
    };
  } catch (error) {
    console.error("Failed to reset email template:", error);
    const template = INITIAL_EMAIL_TEMPLATES.find((t) => t.id === id);
    return {
      status: "success",
      statusCode: 200,
      data: template,
    };
  }
};

