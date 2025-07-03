import { ProblemRepo } from "../repo";
import { DifficultyLevel } from "../generated/prisma";
import { CustomError } from "../utils/errors/app-error";
import { sendData } from "../utils/RabbitMQ";

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

async function submitSolution(data: {
    problemId: number,
    userId: number,
    language: string,
    solution: string
}) {
    try {
        // Check if problem exists
        const problem = await problemRepo.getById(data.problemId);

        if(!problem) {
            throw new CustomError('The problem does not exist', 404);
        }

        // check the language support or not
        for (let i = 0; i < problem.language.length; i++) {
            if(problem.language[i] !== data.language) {
                throw new CustomError(`This problem does not support ${data.language} language}`, 404);
            }
        }

        // Send data to RabbitMQ
        const message = {
            problem: {
                id: problem.id,
                testCases: problem.testCases
            },
            userId: data.userId,
            language: data.language,
            solution: data.solution
        };

        await sendData(message);
    } catch (error) {
        if(error instanceof CustomError) throw error;
        throw new CustomError('Internal Server Error', 500);
    }
}

export {
    createProblems,
    getAllProblems,
    getProblem,
    submitSolution
}