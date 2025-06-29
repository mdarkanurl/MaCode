import { string, z } from "zod";
import { DifficultyLevel } from '../generated/prisma';

export const createProblemsSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(10),
    difficulty: z.enum([...Object.values(DifficultyLevel) as [string, ...string[]]]),
    tags: z.string().optional()
});