import { randomBytes } from "crypto";
import { fitnessGoalById } from "../store/memory.js";
import { schedulePersist } from "../persistence/filePersistence.js";

function newId() {
  return randomBytes(16).toString("hex");
}

function nameExists(name, excludeId) {
  for (const g of fitnessGoalById.values()) {
    if (g.name === name && g.id !== excludeId) return true;
  }
  return false;
}

export const fitnessGoalDao = {
  /**
   * @param {{ name: string }} fitnessGoal
   */
  create(fitnessGoal) {
    if (nameExists(fitnessGoal.name)) {
      throw new Error("DUPLICATE_NAME");
    }
    const id = newId();
    const row = { id, name: fitnessGoal.name };
    fitnessGoalById.set(id, row);
    schedulePersist();
    return { ...row };
  },

  /**
   * @param {string} fitnessGoalId
   */
  get(fitnessGoalId) {
    const row = fitnessGoalById.get(fitnessGoalId);
    return row ? { ...row } : null;
  },

  list() {
    return { fitnessGoalList: [...fitnessGoalById.values()].map((g) => ({ ...g })) };
  },

  /**
   * @param {{ id: string, name: string }} fitnessGoal
   */
  update(fitnessGoal) {
    const existing = fitnessGoalById.get(fitnessGoal.id);
    if (!existing) return null;
    if (nameExists(fitnessGoal.name, fitnessGoal.id)) {
      throw new Error("DUPLICATE_NAME");
    }
    const row = { id: fitnessGoal.id, name: fitnessGoal.name };
    fitnessGoalById.set(fitnessGoal.id, row);
    schedulePersist();
    return { ...row };
  },

  /**
   * @param {string} fitnessGoalId
   */
  remove(fitnessGoalId) {
    fitnessGoalById.delete(fitnessGoalId);
    schedulePersist();
  },

  getFitnessGoalMap() {
    /** @type {Record<string, { id: string, name: string }>} */
    const fitnessGoalMap = {};
    for (const g of fitnessGoalById.values()) {
      fitnessGoalMap[g.id] = { ...g };
    }
    return fitnessGoalMap;
  },

  /** Seed / test — vložení záznamu s daným ID. */
  _seed(goal) {
    fitnessGoalById.set(goal.id, { ...goal });
    schedulePersist();
  },

  _nameExists(name, excludeId) {
    return nameExists(name, excludeId);
  },
};
