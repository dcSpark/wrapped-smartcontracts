import { Request, Response } from "express";
import { wallet } from "../services/blockchain.service";

export default async (_: Request, res: Response) => {
  return res.json({ signerAddress: wallet.address });
};
