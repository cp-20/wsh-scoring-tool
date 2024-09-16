/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `users_name_idx` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `name`;
