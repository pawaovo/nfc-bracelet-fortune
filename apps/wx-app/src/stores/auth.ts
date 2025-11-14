import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserPartial } from '@shared/types';
import { apiRequest } from '@/api/request';

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string>('');
  const user = ref<UserPartial | null>(null);
  const isLoading = ref(false);
  const nfcId = ref<string>(''); // 当前绑定的nfcId
  const userType = ref<'bound' | 'visitor' | ''>(''); // 用户类型

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

  const setNfcId = (newNfcId: string) => {
    nfcId.value = newNfcId;
    uni.setStorageSync('nfcId', newNfcId);
  };

  const setUserType = (newUserType: 'bound' | 'visitor') => {
    userType.value = newUserType;
    uni.setStorageSync('userType', newUserType);
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const login = (
    authToken: string,
    userData: UserPartial,
    nfcIdValue?: string,
    userTypeValue?: 'bound' | 'visitor'
  ) => {
    setToken(authToken);
    setUser(userData);
    if (nfcIdValue) {
      setNfcId(nfcIdValue);
    }
    if (userTypeValue) {
      setUserType(userTypeValue);
    }
  };

  const logout = () => {
    token.value = '';
    user.value = null;
    nfcId.value = '';
    userType.value = '';
    // 清除本地存储
    uni.removeStorageSync('token');
    uni.removeStorageSync('user');
    uni.removeStorageSync('nfcId');
    uni.removeStorageSync('userType');
    // 清除 API 请求的 token
    apiRequest.clearAuthToken();
  };

  const initFromStorage = () => {
    try {
      const storedToken = uni.getStorageSync('token');
      const storedUser = uni.getStorageSync('user');
      const storedNfcId = uni.getStorageSync('nfcId');
      const storedUserType = uni.getStorageSync('userType');

      if (storedToken) {
        token.value = storedToken;
        // 同时设置 API 请求的 token
        apiRequest.setAuthToken(storedToken);
      }

      if (storedUser) {
        user.value = storedUser;
      }

      if (storedNfcId) {
        nfcId.value = storedNfcId;
      }

      if (storedUserType) {
        userType.value = storedUserType;
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
    nfcId,
    userType,

    // 计算属性
    isAuthenticated,
    isProfileComplete,

    // 动作
    setToken,
    setUser,
    setNfcId,
    setUserType,
    setLoading,
    login,
    logout,
    initFromStorage,
    updateUserProfile,
  };
});
