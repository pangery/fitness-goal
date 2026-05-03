import cors from "cors";
import { config } from "../config.js";

export function createCorsMiddleware() {
  const origin = config.corsOrigin;
  if (origin === "*") {
    return cors({ origin: true });
  }
  const allowList = origin.split(",").map((s) => s.trim()).filter(Boolean);
  return cors({
    origin(originHeader, cb) {
      if (!originHeader || allowList.includes(originHeader)) {
        cb(null, true);
        return;
      }
      cb(null, false);
    },
  });
}
