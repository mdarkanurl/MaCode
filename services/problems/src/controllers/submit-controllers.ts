import { problemsSchema } from "../schema";
import { problemsServices } from "../services";
import { CustomError } from "../utils/errors/app-error";
import { Request, Response, NextFunction } from "express";


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

        const submits = await problemsServices.submitSolution(parseData.data);

        res.status(200).json({
            Success: true,
            Message: 'Solution submitted successfully',
            Data: submits,
            Errors: {}
        });
        return;
    } catch (error) {
        if(error instanceof CustomError) return next(error);
        return next(new CustomError('Internal Server Error', 500));
    }
}

async function getSubmission(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const id = parseInt(req.params.id);

        if(!id) {
            res.status(400).json({
                Success: false,
                Message: 'Invalid input, ID params missing',
                Data: {},
                Errors: {}
            });
            return;
        }

        const submissions = await problemsServices.getSubmission({ id });

        if(submissions.status === "PENDING") {
            res.status(200).json({
                Success: false,
                Message: 'Submissions status still PENDING',
                Data: submissions,
                Errors: {}
            });
            return;  
        }

        res.status(200).json({
            Success: true,
            Message: 'Submissions status changes to PENDING',
            Data: submissions,
            Errors: {}
        });
        return;
    } catch (error) {
        if(error instanceof CustomError) return next(error);
        return next(new CustomError('Internal Server Error', 500));
    }
}

export {
    submitSolution,
    getSubmission
}