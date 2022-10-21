import { Request, Response } from "express";
import config from "../config";

export default async (_: Request, res: Response) => {
  return res.json({ factoryAddress: config.factoryAddress });
};
