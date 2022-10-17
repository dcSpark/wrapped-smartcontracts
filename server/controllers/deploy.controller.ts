import { Request, Response } from "express";
import { deployActor } from "../services/deploy.service";

export default async (req: Request, res: Response) => {
  const { salt, initCode } = req.body;

  try {
    const { actorAddress, tx } = await deployActor(salt, initCode);

    return res.json({ actorAddress, txHash: tx.hash, success: true });
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message });
  }
};
