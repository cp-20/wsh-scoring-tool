/*
  Warnings:

  - You are about to drop the column `createdAt` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `submissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `submissions` DROP FOREIGN KEY `submissions_userId_fkey`;

-- AlterTable
ALTER TABLE `submissions` DROP COLUMN `createdAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `createdAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE INDEX `submissions_user_id_idx` ON `submissions`(`user_id`);

-- CreateIndex
CREATE INDEX `submissions_score_idx` ON `submissions`(`score`);

-- CreateIndex
CREATE INDEX `submissions_created_at_idx` ON `submissions`(`created_at`);

-- CreateIndex
CREATE INDEX `users_name_idx` ON `users`(`name`);

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
