import createServer from "./utils/createApp";
import { runDb } from "./db/db";

const app = createServer();

const port = process.env.PORT || 5000;

const startApp = async () => {
  await runDb();
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

startApp();

export default app;
