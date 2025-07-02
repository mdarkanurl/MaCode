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

        if(!parseData.success) {
            res.status(400).json({
                Success: false,
                Message: 'Invalid input',
                Data: {},
                Errors: parseData.error.errors
            });
            return;
        }

        const problems = await problemsServices.createProblems(parseData.data);
        
        res.status(201).json({
            Success: true,
            Message: 'Problem created successfully',
            Data: problems,
            Errors: {}
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
        const problems = await problemsServices.getAllProblems();
        res.status(200).json({
            Success: true,
            Message: 'All problems successfully get from Database',
            Data: problems,
            Errors: {}
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
        const parseData = problemsSchema.getProblemSchema.safeParse({ id: parseInt(req.params.id) });

        if(!parseData.success) {
            res.status(400).json({
                Success: false,
                Message: 'Invalid input',
                Data: {},
                Errors: parseData.error.errors
            });
            return;
        }

        const problem = await problemsServices.getProblem(parseData.data);

        res.status(200).json({
            Success: true,
            Message: 'Problem get successfully',
            Data: problem,
            Errors: {}
        });
        return;
    } catch (error) {
        if(error instanceof CustomError) return next(error);
        return next(new CustomError('Internal Server Error', 500));
    }
}

async function submitSolution(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const parseData = problemsSchema.submitSolutionSchema.safeParse(req.body);

        if(!parseData.success) {
            res.status(400).json({
                Success: false,
                Message: 'Invalid input',
                Data: {},
                Errors: parseData.error.errors
            });
            return;
        }

        await problemsServices.submitSolution(parseData.data);

        res.status(200).json({
            Success: true,
            Message: 'Solution submitted successfully',
            Data: {},
            Errors: {}
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
    getProblem,
    submitSolution
}