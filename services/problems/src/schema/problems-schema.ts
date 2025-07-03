import { string, z } from "zod";
import { DifficultyLevel } from '../generated/prisma';

export const createProblemsSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(10),
    difficulty: z.enum([...Object.values(DifficultyLevel) as [string, ...string[]]]),
    testCases: z.array(z.object({
        input: z.string().min(1),
        output: z.string().min(1)
    })),
    tags: z.string().optional()
});

export const getProblemSchema = z.object({
    id: z.number()
});

export const submitSolutionSchema = z.object({
    userId: z.number(),
    problemId: z.number(),
    language: z.string().min(1),
    solution: z.string().min(1)
});