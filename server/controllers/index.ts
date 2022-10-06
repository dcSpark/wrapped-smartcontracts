import express from "express";
import canExecuteController from "./canExecute.controller";
import deployController from "./deploy.controller";
import executeController from "./execute.controller";

const app = express();

app.use(express.json());

app.post("/deploy", deployController);

app.get("/canExecute/:actorAddress", canExecuteController);
app.post("/execute", executeController);

export default app;
