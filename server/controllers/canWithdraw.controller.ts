import { Request, Response } from "express";
import { canWithdraw } from "../services/withdraw.service";

export default async (req: Request, res: Response) => {
  const { actorAddress } = req.params;

  try {
    return res.json({
      canWithdraw: await canWithdraw(actorAddress),
      success: true,
    });
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message, success: false });
  }
};
