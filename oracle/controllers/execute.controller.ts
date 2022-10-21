import { Request, Response } from "express";
import { canExecute, execute } from "../services/execute.service";

export default async (req: Request, res: Response) => {
  const { actorAddress } = req.body;

  if (!canExecute(actorAddress)) {
    return res.status(400).json({ message: "Execute condition not met" });
  }

  try {
    const { hash: txHash } = await execute(actorAddress);

    return res.status(200).json({ txHash, success: true });
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message, success: false });
  }
};
