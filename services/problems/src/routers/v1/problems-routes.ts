import { Router } from "express";
import { problemscontrollers } from "../../controllers";
const router = Router();

router.post('/', problemscontrollers.createProblems);

export default router;