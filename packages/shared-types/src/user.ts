// packages/shared-types/src/user.ts
export interface User {
  id: string; // UUID or database auto-increment ID
  wechatOpenId: string; // ΢�� OpenID, Unique
  username: string | null; // �û�����
  name: string | null; // �û��ƺ�
  birthday: Date | null; // �û����� (����)
  password?: string | null; // ���� (���ƽ׶�Ϊ�ɼ�ɶ���洢)
  createdAt: Date;
  updatedAt: Date;

  // Relations (managed by ORM/Prisma)
  // bracelets?: Bracelet[];
  // dailyFortunes?: DailyFortune[];
}

export interface UserPartial {
  id: string;
  wechatOpenId: string;
  username: string | null;
  name: string | null;
  birthday: Date | null;
}

// DTO for updating user profile
export interface UpdateProfileDto {
  username: string;
  password: string;
  name: string;
  birthday: string; // YYYY-MM-DD format
  nfcId?: string;
}

// User data for fortune generation
export interface UserForFortune {
  id: string;
  name?: string | null;
  birthday?: Date | null;
}
