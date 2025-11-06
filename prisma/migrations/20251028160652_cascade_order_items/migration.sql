-- CreateTable
CREATE TABLE `WeeklySchedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayOfWeek` VARCHAR(191) NOT NULL,
    `openHour` VARCHAR(191) NULL,
    `closeHour` VARCHAR(191) NULL,
    `alwaysClosed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DateScheduleOverride` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `openHour` VARCHAR(191) NULL,
    `closeHour` VARCHAR(191) NULL,
    `alwaysClosed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DateScheduleOverride_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
