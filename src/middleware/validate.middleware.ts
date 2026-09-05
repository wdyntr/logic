import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";


export const validate = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            return res.status(422).json({
                message: 'Validasi gagal',
                errors: result.error.flatten().fieldErrors
            })
        }

        req.body = result.data
        next()
    }
}