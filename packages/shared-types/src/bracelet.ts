// packages/shared-types/src/bracelet.ts
export interface Bracelet {
  id: string; // UUID or database auto-increment ID
  nfcId: string; // 手链 NFC ID, Unique
  userId: string | null; // FK to User.id, null if unbound
  boundAt: Date | null; // 绑定时间
  createdAt: Date;
  updatedAt: Date;

  // Relations (managed by ORM/Prisma)
  // user?: User | null;
}
