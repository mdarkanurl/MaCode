import { ProblemRepo } from "../repo";
import { DifficultyLevel } from "../generated/prisma";
import { CustomError } from "../utils/errors/app-error";

const problemRepo = new ProblemRepo();

async function createProblems(data: {
    id: string,
    title: string,
    description: string,
    functionName: string,
    language: string[],
    difficulty: DifficultyLevel,
    testCases: JSON[],
    tags?: string
}) {
    try {
        // Check if problem already exist or not
        const isProblemExist = await problemRepo.getByProblemId(data.id);

        if(isProblemExist) {
            throw new CustomError(`The problem id ${data.id} already taken`, 400);
        }


        // Create problems and add to DB
        const problems = await problemRepo.create(data);
        return {
            id: problems.id,
            title: problems.title,
            description: problems.description,
            functionName: problems.functionName,
            language: problems.language,
            difficulty: problems.difficulty,
            testCases: problems.testCases,
            tags: problems.tags
        };
    } catch (error) {
        if(error instanceof CustomError) throw error;
        throw new CustomError('Internal Server Error', 500);
    }
}

async function getAllProblems() {
    try {
        // Get all problems from Database
        const problems = await problemRepo.getAll();

        if(problems.length === 0) {
            throw new CustomError('No problems found', 404);
        }

        return {
            id: problems.id,
            title: problems.title,
            description: problems.description,
            difficulty: problems.difficulty,
            tags: problems.tags
        };
    } catch (error) {
        if(error instanceof CustomError) throw error;
        throw new CustomError('Internal Server Error', 500);
    }
}

async function getProblem(data: { id: number }) {
    try {
        // Find problem by ID
        const problem = await problemRepo.getById(data.id);

        if(!problem) {
            throw new CustomError('Problem not found', 404);
        }

        return {
            id: problem.id,
            title: problem.title,
            description: problem.description,
            difficulty: problem.difficulty,
            tags: problem.tags
        };
    } catch (error) {
        if(error instanceof CustomError) throw error;
        throw new CustomError('Internal Server Error', 500);
    }
}

export {
    createProblems,
    getAllProblems,
    getProblem
}