import { createProblems, getAllProblems, getProblem } from "./problems-services";
import { submitSolution } from "./submit-service";

const problemsServices = {
    createProblems,
    getAllProblems,
    getProblem,
    submitSolution
}

export {
    problemsServices
}