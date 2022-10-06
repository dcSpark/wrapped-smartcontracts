import config from "./config";
import app from "./controllers";

app.listen(config.port, () => console.log(`[server]: Server is running at port ${config.port}`));
