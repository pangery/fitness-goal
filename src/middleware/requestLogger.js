import { config } from "../config.js";

export function requestLogger(req, res, next) {
  if (!config.requestLog) {
    next();
    return;
  }
  const started = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - started;
    console.log(
      `${req.method} ${req.originalUrl} → ${res.statusCode} (${ms} ms)`,
    );
  });
  next();
}
