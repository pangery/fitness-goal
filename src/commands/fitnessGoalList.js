import { fitnessGoalDao } from "../daos/fitnessGoalDao.js";

export function fitnessGoalListCommand() {
  const { fitnessGoalList } = fitnessGoalDao.list();
  return {
    dtoOut: {
      fitnessGoalList,
    },
  };
}
