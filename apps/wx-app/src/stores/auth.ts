import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserPartial } from '@shared/types';
import { apiRequest } from '@/api/request';

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string>('');
  const user = ref<UserPartial | null>(null);
  const isLoading = ref(false);

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isProfileComplete = computed(() => {
    if (!user.value) return false;
    return !!(user.value.name && user.value.birthday && user.value.username);
  });

  // 动作
  const setToken = (newToken: string) => {
    token.value = newToken;
    // 同步到本地存储
    uni.setStorageSync('token', newToken);
    // 同时设置 API 请求的 token
    apiRequest.setAuthToken(newToken);
  };

  const setUser = (newUser: UserPartial) => {
    user.value = newUser;
    // 同步到本地存储
    uni.setStorageSync('user', newUser);
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const login = (authToken: string, userData: UserPartial) => {
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    token.value = '';
    user.value = null;
    // 清除本地存储
    uni.removeStorageSync('token');
    uni.removeStorageSync('user');
    // 清除 API 请求的 token
    apiRequest.clearAuthToken();
  };

  const initFromStorage = () => {
    try {
      const storedToken = uni.getStorageSync('token');
      const storedUser = uni.getStorageSync('user');

      if (storedToken) {
        token.value = storedToken;
        // 同时设置 API 请求的 token
        apiRequest.setAuthToken(storedToken);
      }

      if (storedUser) {
        user.value = storedUser;
      }
    } catch (error) {
      console.error('Failed to init auth from storage:', error);
    }
  };

  const updateUserProfile = (updatedUser: UserPartial) => {
    if (user.value) {
      user.value = { ...user.value, ...updatedUser };
      uni.setStorageSync('user', user.value);
    }
  };

  return {
    // 状态
    token,
    user,
    isLoading,

    // 计算属性
    isAuthenticated,
    isProfileComplete,

    // 动作
    setToken,
    setUser,
    setLoading,
    login,
    logout,
    initFromStorage,
    updateUserProfile,
  };
});
