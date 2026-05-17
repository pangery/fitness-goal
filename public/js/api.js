const API_BASE = "";

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
export async function api(path, init = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init.headers },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || res.statusText);
    err.code = data?.error?.code;
    throw err;
  }
  return data;
}

export const fitnessGoals = {
  list: () => api("/fitnessGoal/list"),
  create: (name) =>
    api("/fitnessGoal/create", { method: "POST", body: JSON.stringify({ name }) }),
  get: (id) => api(`/fitnessGoal/get/${id}`),
  update: (id, name) =>
    api("/fitnessGoal/update", { method: "POST", body: JSON.stringify({ id, name }) }),
  remove: (fitnessGoalId) =>
    api("/fitnessGoal/remove", {
      method: "POST",
      body: JSON.stringify({ fitnessGoalId }),
    }),
};

export const stats = {
  overview: () => api("/stats/overview"),
};

export const exercises = {
  listByGoal: (fitnessGoalId) =>
    api(`/exercise/listByFitnessGoalId?fitnessGoalId=${encodeURIComponent(fitnessGoalId)}`),
  create: (dtoIn) =>
    api("/exercise/create", { method: "POST", body: JSON.stringify(dtoIn) }),
  update: (dtoIn) =>
    api("/exercise/update", { method: "POST", body: JSON.stringify(dtoIn) }),
  remove: (exerciseId) =>
    api("/exercise/remove", { method: "POST", body: JSON.stringify({ exerciseId }) }),
};
