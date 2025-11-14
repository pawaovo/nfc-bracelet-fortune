export interface User {
  id: string;
  wechatOpenId: string;
  username: string | null;
  name: string | null;
  birthday: Date | null;
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
}

export interface UpdateProfileDto {
  username: string;
  password: string;
  name: string;
  birthday: string; // YYYY-MM-DD
  nfcId?: string;
}

export interface WebRegisterRequest {
  username: string;
  password: string;
  name: string;
  birthday: string; // YYYY-MM-DD
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
