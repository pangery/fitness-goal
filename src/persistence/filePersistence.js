import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname } from "path";
import { fitnessGoalById, exerciseById } from "../store/memory.js";
import { config } from "../config.js";

let saveTimer = null;

/**
 * Načte JSON soubor do map. Chybějící soubor = prázdné mapy.
 */
export async function loadStores() {
  const filePath = config.dataFile;
  let raw;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (e) {
    if (/** @type {NodeJS.ErrnoException} */ (e).code === "ENOENT") {
      return;
    }
    throw e;
  }

  const data = JSON.parse(raw);
  fitnessGoalById.clear();
  exerciseById.clear();

  for (const g of data.fitnessGoals ?? []) {
    if (g?.id && g?.name) {
      fitnessGoalById.set(g.id, { id: g.id, name: g.name });
    }
  }
  for (const ex of data.exercises ?? []) {
    if (ex?.id && ex?.name != null) {
      exerciseById.set(ex.id, normalizeExerciseRow(ex));
    }
  }
}

/**
 * @param {Record<string, unknown>} ex
 */
function normalizeExerciseRow(ex) {
  /** @type {import('../store/memory.js').ExerciseRow} */
  const row = {
    id: String(ex.id),
    name: String(ex.name),
    sets: Number(ex.sets),
    repetitions: Number(ex.repetitions),
    date: String(ex.date),
    fitnessGoalId: String(ex.fitnessGoalId),
  };
  if (ex.note != null && ex.note !== "") {
    row.note = String(ex.note);
  }
  if (ex.durationMinutes != null && Number.isFinite(Number(ex.durationMinutes))) {
    row.durationMinutes = Math.round(Number(ex.durationMinutes));
  }
  return row;
}

export function schedulePersist() {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    saveTimer = null;
    persistNow().catch((err) => console.error("[fitness-goal] persist failed:", err));
  }, 75);
}

export async function persistNow() {
  const filePath = config.dataFile;
  await mkdir(dirname(filePath), { recursive: true });
  const payload = {
    fitnessGoals: [...fitnessGoalById.values()],
    exercises: [...exerciseById.values()],
  };
  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}
