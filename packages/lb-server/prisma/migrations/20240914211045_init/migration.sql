/*
  Warnings:

  - Added the required column `url` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `url` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `users_url_idx` ON `users`(`url`);
