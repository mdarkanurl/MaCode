import { Router } from "express";
import { problemscontrollers } from "../../controllers";
const router = Router();

router.post('/problems', problemscontrollers.createProblems);
router.get('/problems', problemscontrollers.getAllProblems);

export default router;