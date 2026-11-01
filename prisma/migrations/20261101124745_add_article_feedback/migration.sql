-- CreateTable
CREATE TABLE `ArticleFeedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nickname` VARCHAR(30) NOT NULL,
    `content` VARCHAR(1000) NOT NULL,
    `rating` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `visitorHash` CHAR(64) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,
    `articleId` INTEGER NOT NULL,

    INDEX `ArticleFeedback_articleId_status_createdAt_idx`(`articleId`, `status`, `createdAt`),
    INDEX `ArticleFeedback_visitorHash_articleId_createdAt_idx`(`visitorHash`, `articleId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ArticleFeedback` ADD CONSTRAINT `ArticleFeedback_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
