import { Request, Response } from "express";
import { canEmergencyWithdraw, emergencyWithdraw } from "../services/withdraw.service";

export default async (req: Request, res: Response) => {
  const { actorAddress } = req.body;

  if (!canEmergencyWithdraw(actorAddress)) {
    return res.status(400).json({ error: "Emergency withdraw condition not met" });
  }

  try {
    const { hash: txHash } = await emergencyWithdraw(actorAddress);

    return res.status(200).json({ txHash, success: true });
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message });
  }
};
