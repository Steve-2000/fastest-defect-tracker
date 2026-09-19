import apiClient from "../lib/api";
import { ENDPOINTS } from "../utils/apiendpoint";

// SMTP Configs
export interface CreateSmtpConfigRequest {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail?: string;
  fromName?: string;
  encryption?: string;
}

export const getSmtpConfigs = async () => {
  try { const r = await apiClient.get(ENDPOINTS.emailConfig); return r.data.data ?? []; }
  catch { return []; }
};

export const createSmtpConfig = async (data: CreateSmtpConfigRequest) => {
  const r = await apiClient.post(ENDPOINTS.emailConfig, data);
  return r.data;
};

export const updateSmtpConfig = async (id: number, data: Partial<CreateSmtpConfigRequest>) => {
  const r = await apiClient.put(ENDPOINTS.emailConfigById(id), data);
  return r.data;
};

export const deleteSmtpConfig = async (id: number) => {
  const r = await apiClient.delete(ENDPOINTS.emailConfigById(id));
  return r.data;
};

export const updateSmtpConfigStatus = async (id: number, enabled: boolean) => {
  const r = await apiClient.patch(ENDPOINTS.emailConfigEnable(id), { enabled });
  return r.data;
};

// Aliases
export const getEmailConfigs = getSmtpConfigs;
export const createEmailConfig = createSmtpConfig;
export const updateEmailConfig = updateSmtpConfig;
export const enableEmailConfig = updateSmtpConfigStatus;

// Email Point Setups
export const getAllEmailPointSetups = async () => {
  try { const r = await apiClient.get(ENDPOINTS.emailPointSetup); return r.data.data ?? []; }
  catch { return []; }
};

export const enableEmailPointSetup = async (id: number) => {
  const r = await apiClient.patch(ENDPOINTS.emailPointSetupEnable(id), {});
  return r.data;
};

export const updateUserExtraPoints = async (userId: number, data: any) => {
  const r = await apiClient.post(ENDPOINTS.userExtraPoints(userId), data);
  return r.data;
};

// Role Notifications
export const getRoleNotificationChannels = async () => {
  try { const r = await apiClient.get(ENDPOINTS.roleNotificationUpdate); return r.data.data ?? []; }
  catch { return []; }
};

export const updateRoleNotificationRules = async (data: any) => {
  const r = await apiClient.post(ENDPOINTS.roleNotificationUpdate, data);
  return r.data;
};

// Email Recipients
export const getEmailRecipientsRoleMatrix = async () => {
  try { const r = await apiClient.get(ENDPOINTS.emailRecipientsRoleMatrix); return r.data.data ?? {}; }
  catch { return {}; }
};

// Email Templates
export const getEmailTemplates = async () => {
  try { const r = await apiClient.get(ENDPOINTS.emailTemplate); return r.data.data ?? []; }
  catch { return []; }
};

export const updateEmailTemplate = async (id: number, data: any) => {
  const r = await apiClient.put(ENDPOINTS.emailTemplateById(id), data);
  return r.data;
};

export const resetEmailTemplate = async (id: number) => {
  const r = await apiClient.post(ENDPOINTS.emailTemplateReset(id), {});
  return r.data;
};

// Email Sent / Log
export const getEmailSent = async () => {
  try { const r = await apiClient.get(ENDPOINTS.emailSent); return r.data.data ?? []; }
  catch { return []; }
};

export const getAllEmailTemplates = async () => [];


export const updateEmailPointSetupStatus = async (data: any) => ({});

