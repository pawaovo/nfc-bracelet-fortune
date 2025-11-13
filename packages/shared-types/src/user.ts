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
  nfcId: string;
}

export interface UserForFortune {
  id: string;
  name?: string | null;
  birthday?: Date | null;
}
