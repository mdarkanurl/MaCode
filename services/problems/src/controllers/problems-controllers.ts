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
                success: false,
                message: 'Invalid input',
                data: {},
                errors: parseData.error.errors
            });
            return;
        }

        const problems = problemsServices.createProblems(parseData.data);
        res.status(201).json({
            success: true,
            message: 'Problem created successfully',
            data: problems,
            errors: {}
        });
        return;
    } catch (error) {
        if(error instanceof CustomError) return next(error);
        return next(new CustomError('Internal Server Error', 500));
    }
}

async function getAllProblems(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const problems = problemsServices.getAllProblems();
        res.status(200).json({
            success: true,
            message: 'All problems successfully get from Database',
            data: problems,
            errors: {}
        });
        return;
    } catch (error) {
        if(error instanceof CustomError) return next(error);
        return next(new CustomError('Internal Server Error', 500));
    }
}

async function getProblem(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const parseData: any = problemsSchema.getProblemSchema.safeParse(req.params);

        if(!parseData) {
            res.status(400).json({
                success: false,
                message: 'Invalid input',
                data: {},
                errors: parseData.error.errors
            });
            return;
        }

        const problem = problemsServices.getProblem(parseData.data);
        res.status(200).json({
            success: true,
            message: 'Problem get successfully',
            data: problem,
            errors: {}
        });
        return;
    } catch (error) {
        if(error instanceof CustomError) return next(error);
        return next(new CustomError('Internal Server Error', 500));
    }
}

export {
    createProblems,
    getAllProblems,
    getProblem
}