import { createApp } from "./app";
import { config } from "./config";

const app = createApp();

app.listen(config.PORT, () => {
  console.log(`[api] listening on http://localhost:${config.PORT}`);
  console.log(`[api] health check:  http://localhost:${config.PORT}/api/health`);
});
