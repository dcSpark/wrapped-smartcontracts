import { Request, Response } from "express";
import { canExecute } from "../services/execute.service";

export default async (req: Request, res: Response) => {
  const { actorAddress } = req.params;

  try {
    return res.json({
      canExecute: await canExecute(actorAddress),
      success: true,
    });
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message, success: false });
  }
};
