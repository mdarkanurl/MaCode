import { createProblems, getAllProblems, getProblem, updateProblem } from "./problems-controllers";
import { submitSolution } from "./submit-controllers";

const problemscontrollers = {
    createProblems,
    getAllProblems,
    getProblem,
    submitSolution,
    updateProblem
}

export {
    problemscontrollers
}