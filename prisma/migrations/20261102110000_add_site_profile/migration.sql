-- CreateTable
CREATE TABLE `SiteProfile` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `role` VARCHAR(100) NOT NULL,
    `heroTitle` VARCHAR(100) NOT NULL,
    `heroHighlight` VARCHAR(100) NOT NULL,
    `introduction` VARCHAR(500) NOT NULL,
    `statusText` VARCHAR(100) NOT NULL,
    `aboutTitle` VARCHAR(100) NOT NULL,
    `aboutParagraphOne` VARCHAR(1000) NOT NULL,
    `aboutParagraphTwo` VARCHAR(1000) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- The site has one owner, so the public profile always uses id = 1.
INSERT INTO `SiteProfile` (
    `id`, `name`, `role`, `heroTitle`, `heroHighlight`, `introduction`,
    `statusText`, `aboutTitle`, `aboutParagraphOne`, `aboutParagraphTwo`, `updatedAt`
) VALUES (
    1,
    '盖洋阳',
    '独立开发者 · 公开学习',
    '把一个想法，',
    '做成真的。',
    '我是盖洋阳，一名正在把学习变成真实产品的独立开发者。这里记录我如何借助 AI，把一个个人 CMS 从想法、调研一路做到上线。',
    '正在搭建第一版',
    '不假装已经成为专家。',
    '我还在学习，也还没有一个确定的职业标签。但我想把学习过程变成真实的产品，而不是停留在收藏教程。',
    '这个网站既是我的个人主页，也是我的实验场：我会公开每一次选择、遇到的问题，以及最后真正学会了什么。',
    CURRENT_TIMESTAMP(3)
);
