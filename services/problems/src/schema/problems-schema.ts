import { z } from "zod";
import { DifficultyLevel } from '../generated/prisma';

export const createProblemsSchema = z.object({
    id: z.string(),
    title: z.string().min(5),
    description: z.string().min(10),
    functionName: z.string(),
    language: z.array(z.string()).min(1),
    difficulty: z.enum([...Object.values(DifficultyLevel) as [string, ...string[]]]),
    testCases: z.array(z.object({
        input: z.string().min(1),
        expected: z.string().min(1)
    })),
    tags: z.array(z.string()).optional()
});

export const getProblemSchema = z.object({
    id: z.number()
});

export const submitSolutionSchema = z.object({
    userId: z.number(),
    problemId: z.string(),
    language: z.string().min(1),
    code: z.string().min(1)
});