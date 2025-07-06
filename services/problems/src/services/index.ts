import { createProblems, getAllProblems, getProblem, updateProblem } from "./problems-services";
import { submitSolution } from "./submit-service";

const problemsServices = {
    createProblems,
    getAllProblems,
    getProblem,
    submitSolution,
    updateProblem
}

export {
    problemsServices
}