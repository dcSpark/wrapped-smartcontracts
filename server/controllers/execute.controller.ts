import { Request, Response } from "express";
import { canExecute, execute } from "../services/execute.service";

export default async (req: Request, res: Response) => {
  const { actorAddress } = req.body;

  if (!canExecute(actorAddress)) {
    return res.status(400);
  }

  await execute(actorAddress);

  return res.status(200);
};
