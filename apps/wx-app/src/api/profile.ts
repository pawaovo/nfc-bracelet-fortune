import { apiRequest } from './request';
import type {
  ApiResponse,
  UpdateProfileDto,
  UserPartial,
  WebRegisterRequest,
} from '@shared/types';

export class ProfileService {
  async updateProfile(
    profileData: UpdateProfileDto,
  ): Promise<ApiResponse<UserPartial>> {
    return apiRequest.put<UserPartial>('profile', profileData);
  }

  async registerWeb(
    payload: WebRegisterRequest,
  ): Promise<ApiResponse<UserPartial>> {
    return apiRequest.post<UserPartial>('profile/web-register', payload);
  }

  async getCurrentProfile(): Promise<ApiResponse<UserPartial>> {
    return apiRequest.get<UserPartial>('profile');
  }
}

export const profileService = new ProfileService();

export const isProfileComplete = (user: UserPartial | null): boolean => {
  if (!user) return false;
  return !!(user.name && user.birthday && user.username);
};

export const formatBirthday = (birthday: string): string => {
  if (!birthday) return '';
  try {
    const date = new Date(birthday);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  } catch (error) {
    console.error('日期格式化失败:', error);
    return birthday;
  }
};

export const validateBirthday = (birthday: string): boolean => {
  if (!birthday) return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(birthday)) return false;
  const date = new Date(birthday);
  if (isNaN(date.getTime())) return false;
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear;
};

export const validateName = (name: string): boolean => {
  if (!name) return false;
  const trimmedName = name.trim();
  if (trimmedName.length < 1 || trimmedName.length > 20) return false;
  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/;
  return nameRegex.test(trimmedName);
};
