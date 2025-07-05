import { ProblemRepo } from "../repo";
import { CustomError } from "../utils/errors/app-error";
import { sendData } from "../utils/RabbitMQ";

const problemRepo = new ProblemRepo();


async function submitSolution(data: {
    problemId: string,
    userId: number,
    language: string,
    solution: string
}) {
    try {
        // Check if problem exists
        const problem = await problemRepo.getByProblemId(data.problemId);

        if(!problem) {
            throw new CustomError('The problem does not exist', 404);
        }

        // check the language support or not
        for (let i = 0; i < problem.language.length; i++) {
            if(!problem.language.includes(data.language)) {
                throw new CustomError(`This problem does not support ${data.language} language}`, 404);
            }
        }

        // Send data to RabbitMQ
        const message = {
            problemId: problem.id,
            problemName: problem.functionName,
            testCases: problem.testCases,
            userId: data.userId,
            language: data.language,
            functionName: problem.functionName,
            solution: data.solution
        };

        await sendData(message);
    } catch (error) {
        if(error instanceof CustomError) throw error;
        throw new CustomError('Internal Server Error', 500);
    }
}

export {
    submitSolution
}