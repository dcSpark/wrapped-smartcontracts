import { Request, Response } from "express";
import { canWithdraw, withdraw } from "../services/withdraw.service";

export default async (req: Request, res: Response) => {
  const { actorAddress } = req.body;

  if (!canWithdraw(actorAddress)) {
    return res.status(400).json({ success: false });
  }

  try {
    const { hash: txHash } = await withdraw(actorAddress);

    return res.status(200).json({ txHash, success: true });
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message, success: false });
  }
};
