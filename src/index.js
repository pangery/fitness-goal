import "dotenv/config";
import express from "express";
import { config } from "./config.js";
import { loadStores, persistNow } from "./persistence/filePersistence.js";
import { fitnessGoalRouter } from "./routes/fitnessGoal.js";
import { exerciseRouter } from "./routes/exercise.js";
import { statsRouter } from "./routes/stats.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { createCorsMiddleware } from "./middleware/cors.js";
import { seedDemoData } from "./seed.js";

const { port, gatewayPrefix: BASE } = config;

const app = express();
app.use(createCorsMiddleware());
app.use(requestLogger);
app.use(express.json());

app.use(`${BASE}/fitnessGoal`, fitnessGoalRouter);
app.use(`${BASE}/exercise`, exerciseRouter);
app.use(`${BASE}/stats`, statsRouter);

app.get(`${BASE}/health`, (req, res) => {
  res.json({
    ok: true,
    service: "fitness-goal",
    persistence: config.dataFile,
    endpoints: {
      fitnessGoal: [
        "GET /fitnessGoal/list",
        "POST /fitnessGoal/create",
        "GET /fitnessGoal/get/:fitnessGoalId",
        "POST /fitnessGoal/update",
        "POST /fitnessGoal/remove",
      ],
      exercise: [
        "POST /exercise/create",
        "GET /exercise/list",
        "POST /exercise/update",
        "POST /exercise/remove",
        "GET /exercise/listByFitnessGoalId?fitnessGoalId=",
      ],
      stats: ["GET /stats/overview — volitelně ?year=&month="],
    },
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

async function shutdown(signal) {
  console.log(`\n${signal}: ukládám data…`);
  await persistNow().catch(() => {});
  process.exit(0);
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

async function main() {
  await loadStores();
  seedDemoData();

  app.listen(port, () => {
    console.log(`Fitness Goal API → http://localhost:${port}${BASE || ""}`);
    console.log(`Data file: ${config.dataFile}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
