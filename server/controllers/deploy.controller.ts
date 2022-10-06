import { Request, Response } from "express";
import { deployActor } from "../services/deploy.service";

export default async (req: Request, res: Response) => {
  const { salt, initCode } = req.body;

  return res.json(await deployActor(salt, initCode));
};
