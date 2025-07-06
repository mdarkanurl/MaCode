import { createProblems, getAllProblems, getProblem } from "./problems-controllers";
import { submitSolution } from "./submit-controllers";

const problemscontrollers = {
    createProblems,
    getAllProblems,
    getProblem,
    submitSolution
}

export {
    problemscontrollers
}