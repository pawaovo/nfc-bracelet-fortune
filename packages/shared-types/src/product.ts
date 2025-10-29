// packages/shared-types/src/product.ts
export interface Product {
  id: string; // UUID or database auto-increment ID
  name: string; // 商品名称 (e.g., "蓝宝石手链")
  description: string; // 一句话推荐语 (e.g., "五行属水, 完美契合...")
  imageUrl: string; // 商品图片 URL
  price: number; // 商品价格
  douyinUrl: string; // 跳转的抖音店铺链接
  // Optional attributes for recommendation logic, e.g.:
  // scoreRangeLow?: number; // 推荐给运势分数在此范围的用户
  // scoreRangeHigh?: number;
  // associatedElement?: string; // 推荐给喜用为此元素的用户
  createdAt?: Date;
  updatedAt?: Date;

  // Relations (managed by ORM/Prisma)
  // dailyFortunesRecommendedOn?: DailyFortune[];
}
