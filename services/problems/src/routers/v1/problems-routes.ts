import { Router } from "express";
import { problemscontrollers } from "../../controllers";
const router = Router();

router.post('/problems', problemscontrollers.createProblems);
router.get('/problems', problemscontrollers.getAllProblems);
router.get('/problems/:id', problemscontrollers.getProblem);
router.post('/submit', problemscontrollers.submitSolution);

export default router;