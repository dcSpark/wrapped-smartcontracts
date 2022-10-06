import { Request, Response } from "express";
import { canExecute } from "../services/execute.service";

export default async (req: Request, res: Response) => {
  const { actorAddress } = req.params;

  return res.json({
    canExecute: await canExecute(actorAddress),
  });
};
