-- AlterTable
ALTER TABLE `Article` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Article_deletedAt_idx` ON `Article`(`deletedAt`);
