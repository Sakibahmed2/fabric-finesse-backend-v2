import { NextFunction, Request, RequestHandler } from "express";

const catchAsync = (fn: RequestHandler) => {
  return (req: Request, res: any, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

export default catchAsync;
