-- AlterTable
ALTER TABLE `DateScheduleOverride` ADD COLUMN `recurringYearly` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `alwaysClosed` BOOLEAN NOT NULL DEFAULT true;
