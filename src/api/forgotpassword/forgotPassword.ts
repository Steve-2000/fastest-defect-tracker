import apiClient from '../../lib/api';

export interface ForgotPasswordResponse {
  status: string;
  statusMessage: string;
  data: any;
  statusCode: number;
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post('/api/v1/auth/forgot-password', { email });
  const resData = response.data;
  return {
    status: resData?.status || 'Success',
    statusMessage: resData?.statusMessage || resData?.message || 'Password reset link sent to your email',
    data: resData?.data || null,
    statusCode: resData?.statusCode || response.status || 200,
  };
}

export async function resetPassword(token: string, newPassword: string): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post('/api/v1/auth/reset-password', { token, newPassword });
  const resData = response.data;
  return {
    status: resData?.status || 'Success',
    statusMessage: resData?.statusMessage || resData?.message || 'Password reset successfully',
    data: resData?.data || null,
    statusCode: resData?.statusCode || response.status || 200,
  };
}
