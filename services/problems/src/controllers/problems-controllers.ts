import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/errors/app-error";
import { problemsSchema } from "../schema";
import { problemsServices } from "../services";

async function createProblems(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const parseData: any = problemsSchema.createProblemsSchema.safeParse(req.body);

        if(!parseData) {
            res.status(400).json({
                errors: parseData.error.errors
            });
            return;
        }

        const problems = problemsServices.createProblems(parseData.data);
        return problems;
    } catch (error) {
        if(error instanceof CustomError) return next(error);
        return next(new CustomError('Internal Server Error', 500));
    }
}

export {
    createProblems
}