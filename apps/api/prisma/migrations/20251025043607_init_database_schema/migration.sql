-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "wechat_openid" VARCHAR(128) NOT NULL,
    "name" VARCHAR(255),
    "birthday" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bracelets" (
    "id" UUID NOT NULL,
    "nfc_id" VARCHAR(255) NOT NULL,
    "user_id" UUID,
    "bound_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "bracelets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_fortunes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" VARCHAR(10) NOT NULL,
    "overall_score" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "career_luck" INTEGER NOT NULL,
    "wealth_luck" INTEGER NOT NULL,
    "love_luck" INTEGER NOT NULL,
    "lucky_color" VARCHAR(50) NOT NULL,
    "lucky_number" INTEGER NOT NULL,
    "suggestion" TEXT NOT NULL,
    "recommendation_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_fortunes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" VARCHAR(1024) NOT NULL,
    "price" INTEGER NOT NULL,
    "douyin_url" VARCHAR(1024) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_wechat_openid_key" ON "users"("wechat_openid");

-- CreateIndex
CREATE INDEX "users_wechat_openid_idx" ON "users"("wechat_openid");

-- CreateIndex
CREATE UNIQUE INDEX "bracelets_nfc_id_key" ON "bracelets"("nfc_id");

-- CreateIndex
CREATE INDEX "bracelets_nfc_id_idx" ON "bracelets"("nfc_id");

-- CreateIndex
CREATE INDEX "bracelets_user_id_idx" ON "bracelets"("user_id");

-- CreateIndex
CREATE INDEX "daily_fortunes_date_idx" ON "daily_fortunes"("date");

-- CreateIndex
CREATE INDEX "daily_fortunes_user_id_date_idx" ON "daily_fortunes"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_fortunes_user_id_date_key" ON "daily_fortunes"("user_id", "date");

-- AddForeignKey
ALTER TABLE "bracelets" ADD CONSTRAINT "bracelets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_fortunes" ADD CONSTRAINT "daily_fortunes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_fortunes" ADD CONSTRAINT "daily_fortunes_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
