import express from "express";
import canEmergencyWithdrawController from "./canEmergencyWithdraw.controller";
import canExecuteController from "./canExecute.controller";
import canWithdrawController from "./canWithdraw.controller";
import deployController from "./deploy.controller";
import emergencyWithdrawController from "./emergencyWithdraw.controller";
import executeController from "./execute.controller";
import withdrawController from "./withdraw.controller";

const app = express();

app.use(express.json());

app.post("/deploy", deployController);

app.get("/canExecute/:actorAddress", canExecuteController);
app.post("/execute", executeController);

app.get("/canWithdraw/:actorAddress", canWithdrawController);
app.post("/withdraw", withdrawController);

app.get("/canEmergencyWithdraw/:actorAddress", canEmergencyWithdrawController);
app.post("/emergencyWithdraw", emergencyWithdrawController);

export default app;
