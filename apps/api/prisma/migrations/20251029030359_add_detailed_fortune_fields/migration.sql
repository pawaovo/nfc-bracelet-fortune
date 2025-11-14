-- AlterTable
ALTER TABLE "daily_fortunes" ADD COLUMN     "astro_analysis" TEXT,
ADD COLUMN     "avoidance" TEXT,
ADD COLUMN     "career_analysis" TEXT,
ADD COLUMN     "career_stars" DOUBLE PRECISION,
ADD COLUMN     "love_analysis" TEXT,
ADD COLUMN     "love_stars" DOUBLE PRECISION,
ADD COLUMN     "suitable" VARCHAR(50),
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "unsuitable" VARCHAR(50),
ADD COLUMN     "wealth_analysis" TEXT,
ADD COLUMN     "wealth_stars" DOUBLE PRECISION;
