export interface User {
  id: string;
  wechatOpenId: string;
  username: string | null;
  name: string | null;
  birthday: Date | null;
  birthHour?: number | null; // 出生时辰(0-23)
  birthplace?: string | null; // 出生地
  gender?: string | null; // 性别: male/female
  password?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPartial {
  id: string;
  wechatOpenId: string;
  username: string | null;
  name: string | null;
  birthday: Date | null;
  birthHour?: number | null;
  birthplace?: string | null;
  gender?: string | null;
}

export interface UpdateProfileDto {
  username: string;
  password: string;
  name: string;
  birthday: string; // YYYY-MM-DD
  birthHour?: number; // 出生时辰(0-23)
  birthplace?: string; // 出生地
  gender?: string; // 性别: male/female
  nfcId?: string;
}

export interface WebRegisterRequest {
  username: string;
  password: string;
  name: string;
  birthday: string; // YYYY-MM-DD
  birthHour?: number; // 出生时辰(0-23)
  birthplace?: string; // 出生地
  gender?: string; // 性别: male/female
  nfcId?: string; // 可选：访客用户没有nfcId
}

export interface WebLoginRequest {
  username: string;
  password: string;
  name: string; // 昵称（登录时可更新）
  birthday: string; // 生日（登录时可更新）
  nfcId: string; // 必需：用于验证用户是否绑定该nfcId
}

export interface WebAuthResponse extends UserPartial {
  userType: 'bound' | 'visitor';
}

export interface UserForFortune {
  id: string;
  name?: string | null;
  birthday?: Date | null;
}
