/*
  Warnings:

  - You are about to drop the column `is_default` on the `todos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "todos" DROP COLUMN "is_default",
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT false;
