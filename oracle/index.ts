import config from "./config";
import app from "./controllers";

app.listen(config.port, () => console.log(`[oracle]: Oracle is running at port ${config.port}`));
