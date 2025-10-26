// packages/shared-types/src/user.ts
export interface User {
  id: string; // UUID or database auto-increment ID
  wechatOpenId: string; // 微信 OpenID, Unique
  name: string | null; // 用户称呼
  birthday: Date | null; // 用户生日 (公历)
  createdAt: Date;
  updatedAt: Date;

  // Relations (managed by ORM/Prisma)
  // bracelets?: Bracelet[];
  // dailyFortunes?: DailyFortune[];
}

export interface UserPartial {
  id: string;
  wechatOpenId: string;
  name: string | null;
  birthday: Date | null;
}

// DTO for updating user profile
export interface UpdateProfileDto {
  name: string;
  birthday: string; // YYYY-MM-DD format
}

// User data for fortune generation
export interface UserForFortune {
  id: string;
  name?: string | null;
  birthday?: Date | null;
}
