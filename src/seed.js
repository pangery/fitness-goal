import { fitnessGoalDao } from "./daos/fitnessGoalDao.js";

const DEMO_GOAL_ID = "4f8a5c958ef486f428224943e757091d";

/** Počáteční data podle dokumentace — jen pokud ještě neexistuje. */
export function seedDemoData() {
  if (fitnessGoalDao.get(DEMO_GOAL_ID)) {
    return;
  }
  fitnessGoalDao._seed({
    id: DEMO_GOAL_ID,
    name: "Weight Loss",
  });
}
