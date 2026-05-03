import { resolve } from "path";

const cwd = process.cwd();

export const config = {
  port: Number(process.env.PORT) || 3000,
  gatewayPrefix: process.env.GATEWAY_PREFIX ?? "",
  /** Absolutní cesta k JSON persistenci. */
  dataFile: resolve(process.env.DATA_FILE ?? "data/fitness-goal.json"),
  /** `*` = povolit vše; nebo čárkou oddělené origin URL. */
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  /** Jednoduché request logy (method url status čas). */
  requestLog: process.env.REQUEST_LOG !== "0",
};
