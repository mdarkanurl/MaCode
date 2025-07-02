/*
  Warnings:

  - Added the required column `testCases` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `problem` ADD COLUMN `testCases` JSON NOT NULL;
