// packages/shared-types/src/dailyFortune.ts
export interface DailyFortune {
  id: string; // UUID or database auto-increment ID
  userId: string; // FK to User.id
  date: Date; // 运势对应的日期 (YYYY-MM-DD)
  score: number; // 综合分数 (e.g., 0-100)
  comment: string; // 一句话点评
  careerScore: number; // 事业运分数/星级 (e.g., 1-5)
  wealthScore: number; // 财富运分数/星级
  loveScore: number; // 爱情运分数/星级
  goodElement: string | null; // 今日喜用 (e.g., "金, 水")
  luckyColor: string | null; // 幸运色
  goodFor: string | null; // 宜 (e.g., "合作")
  recommendedProductId: string | null; // FK to Product.id, 可选的当日推荐商品
  createdAt: Date;

  // Relations (managed by ORM/Prisma)
  // user?: User;
  // recommendedProduct?: Product | null;
}

export interface DailyFortuneSummary {
  date: string; // YYYY-MM-DD format
  score: number;
  comment: string;
}
