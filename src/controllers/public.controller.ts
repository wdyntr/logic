import { Request, Response } from 'express';

export const homepage = async (req: Request, res: Response) => {
  res.render('homepage');
};

export const authPage = async (req: Request, res: Response) => {
  res.render('auth');
};