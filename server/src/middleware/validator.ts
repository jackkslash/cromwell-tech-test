import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (result.success) {
    next();
    return;
  }
  
  res.status(400).json({
    message: "Validation error",
    errors: result.error.errors.map(e => e.message)
  });
};
