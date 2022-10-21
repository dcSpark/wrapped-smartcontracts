import express from "express";
import canEmergencyWithdrawController from "./canEmergencyWithdraw.controller";
import canExecuteController from "./canExecute.controller";
import canWithdrawController from "./canWithdraw.controller";
import deployController from "./deploy.controller";
import emergencyWithdrawController from "./emergencyWithdraw.controller";
import executeController from "./execute.controller";
import factoryAddressController from "./factoryAddress.controller";
import pingController from "./ping.controller";
import signerAddressController from "./signerAddress.controller";
import withdrawController from "./withdraw.controller";

const app = express();

app.use(express.json());

app.get("/ping", pingController);
app.get("/signerAddress", signerAddressController);
app.get("/factoryAddress", factoryAddressController);

app.post("/deploy", deployController);

app.get("/canExecute/:actorAddress", canExecuteController);
app.post("/execute", executeController);

app.get("/canWithdraw/:actorAddress", canWithdrawController);
app.post("/withdraw", withdrawController);

app.get("/canEmergencyWithdraw/:actorAddress", canEmergencyWithdrawController);
app.post("/emergencyWithdraw", emergencyWithdrawController);

export default app;
