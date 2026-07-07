import { Request, NextFunction, RequestHandler } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema, source: "body" | "query" | "params" = "body"): RequestHandler => {
  return (req, res, next) => {
    schema
      .parseAsync(req[source])
      .then((parsed: any) => {
        req[source] = parsed;
        next();
      })
      .catch((error: unknown) => {
        next(error);
      });
  };
};

export default validate;
