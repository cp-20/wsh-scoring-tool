/*
  Warnings:

  - You are about to drop the column `created_at` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - Added the required column `userId` to the `submissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `submissions` DROP FOREIGN KEY `submissions_user_id_fkey`;

-- DropIndex
DROP INDEX `submissions_created_at_idx` ON `submissions`;

-- AlterTable
ALTER TABLE `submissions` DROP COLUMN `created_at`,
    DROP COLUMN `user_id`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `created_at`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE INDEX `submissions_userId_idx` ON `submissions`(`userId`);

-- CreateIndex
CREATE INDEX `submissions_createdAt_idx` ON `submissions`(`createdAt`);

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
