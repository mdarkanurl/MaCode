import { ProblemRepo } from "../repo";
import { DifficultyLevel } from "../generated/prisma";
import { CustomError } from "../utils/errors/app-error";

const problemRepo = new ProblemRepo();

async function createProblems(data: {
    title: string,
    description: string,
    difficulty: DifficultyLevel,
    tags: string
}) {
    try {
        // Create problems and add to DB
        const problems = await problemRepo.create(data);

        if(!problems) {
            throw new CustomError('Failed to save data to Database. Please try again', 500);
        }

        return problems;
    } catch (error) {
        if(error instanceof CustomError) return error;
        throw new CustomError('Internal Server Error', 500);
    }
}

async function getAllProblems() {
    try {
        // Get all problems from Database
        const problems = await problemRepo.getAll();
        return problems;
    } catch (error) {
        if(error instanceof CustomError) return error;
        throw new CustomError('Internal Server Error', 500);
    }
}

export {
    createProblems,
    getAllProblems
}