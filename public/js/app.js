import { fitnessGoals, exercises, stats } from "./api.js";

const $ = (sel) => document.querySelector(sel);

const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  goals: [],
  selectedId: null,
  exercises: [],
  search: "",
  editingGoalId: null,
  editingExerciseId: null,
  goalStats: new Map(),
  loading: false,
  valueAnimGen: 0,
  lastReveal: -1,
  detailAnimTimer: 0,
};

const els = {
  toast: $("#toast"),
  goalCount: $("#goalCount"),
  goalSearch: $("#goalSearch"),
  goalList: $("#goalList"),
  emptyState: $("#emptyState"),
  goalDetail: $("#goalDetail"),
  detailLoading: $("#detailLoading"),
  detailInner: $("#detailInner"),
  breadcrumbs: $("#breadcrumbs"),
  goalTitle: $("#goalTitle"),
  goalAvatar: $("#goalAvatar"),
  goalIdShort: $("#goalIdShort"),
  goalLastActivity: $("#goalLastActivity"),
  statExercises: $("#statExercises"),
  statReps: $("#statReps"),
  statDuration: $("#statDuration"),
  detailPanel: $("#detailPanel"),
  detailReveal: $("#detailReveal"),
  detailRevealCue: $("#detailRevealCue"),
  heroCard: $("#goalDetail")?.querySelector(".hero-card"),
  statsGrid: $("#statsGrid"),
  exerciseSection: $("#exerciseSection"),
  topbar: document.querySelector(".topbar"),
  exerciseCards: $("#exerciseCards"),
  exerciseEmpty: $("#exerciseEmpty"),
  exerciseToolbar: $("#exerciseToolbar"),
  exerciseToolbarCount: $("#exerciseToolbarCount"),
  exerciseCount: $("#exerciseCount"),
  goalModal: $("#goalModal"),
  goalForm: $("#goalForm"),
  goalModalTitle: $("#goalModalTitle"),
  exerciseModal: $("#exerciseModal"),
  exerciseForm: $("#exerciseForm"),
  exerciseModalTitle: $("#exerciseModalTitle"),
  volumeHint: $("#volumeHint"),
  confirmModal: $("#confirmModal"),
  confirmTitle: $("#confirmTitle"),
  confirmText: $("#confirmText"),
  confirmOk: $("#confirmOk"),
  confirmCancel: $("#confirmCancel"),
};

function showToast(message, isError = false) {
  els.toast.textContent = message;
  els.toast.classList.toggle("is-error", isError);
  els.toast.hidden = false;
  requestAnimationFrame(() => els.toast.classList.add("is-visible"));
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    els.toast.classList.remove("is-visible");
    setTimeout(() => {
      els.toast.hidden = true;
    }, 250);
  }, 3400);
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function shortId(id) {
  return id.slice(0, 8);
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("cs-CZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateRelative(iso) {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startToday - startThat) / 86400000);

  const time = d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 0) return { label: "Dnes", sub: time };
  if (diffDays === 1) return { label: "Včera", sub: time };
  if (diffDays < 7) return { label: `Před ${diffDays} dny`, sub: formatDate(iso) };
  return {
    label: d.toLocaleDateString("cs-CZ", { day: "numeric", month: "short" }),
    sub: formatDate(iso),
  };
}

function toDatetimeLocalValue(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(value) {
  return new Date(value).toISOString();
}

function computeGoalStats(exerciseList) {
  let reps = 0;
  let duration = 0;
  let lastDate = null;
  for (const ex of exerciseList) {
    reps += ex.sets * ex.repetitions;
    if (ex.durationMinutes) duration += ex.durationMinutes;
    const t = new Date(ex.date).getTime();
    if (!lastDate || t > lastDate) lastDate = t;
  }
  return {
    count: exerciseList.length,
    reps,
    duration,
    lastDate: lastDate ? new Date(lastDate).toISOString() : null,
  };
}

function animateValue(el, end, suffix = "") {
  if (!el) return;
  const gen = ++state.valueAnimGen;
  if (!motionOk) {
    el.textContent = end.toLocaleString("cs-CZ") + suffix;
    el.dataset.animate = String(end);
    return;
  }
  const start = Number(el.dataset.animate ?? el.textContent.replace(/\D/g, "")) || 0;
  const duration = 380;
  const t0 = performance.now();
  el.dataset.animate = String(end);

  function frame(t) {
    if (gen !== state.valueAnimGen) return;
    const p = Math.min((t - t0) / duration, 1);
    const eased = 1 - (1 - p) ** 3;
    el.textContent = Math.round(start + (end - start) * eased).toLocaleString("cs-CZ") + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

let scrollRevealRaf = 0;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function updateScrollReveal() {
  const scroller = els.detailPanel;
  const zone = els.detailReveal;
  if (!scroller || !zone || els.goalDetail.hidden) return;

  const hero = els.goalDetail?.querySelector(".hero-card");
  const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : zone.offsetTop;
  const reveal = clamp(0, 1, (scroller.scrollTop - (heroBottom - 48)) / 140);

  if (Math.abs(reveal - state.lastReveal) < 0.015) return;
  state.lastReveal = reveal;

  zone.style.setProperty("--reveal", reveal.toFixed(3));
  zone.classList.toggle("is-revealed", reveal >= 0.97);
  els.detailRevealCue?.classList.toggle("is-hidden", reveal >= 0.5);
}

function scheduleScrollReveal() {
  cancelAnimationFrame(scrollRevealRaf);
  scrollRevealRaf = requestAnimationFrame(() => {
    updateScrollReveal();
    els.topbar?.classList.toggle("topbar--scrolled", (els.detailPanel?.scrollTop ?? 0) > 12);
  });
}

function wireScrollReveal() {
  els.detailPanel?.addEventListener("scroll", scheduleScrollReveal, { passive: true });
  window.addEventListener("resize", scheduleScrollReveal, { passive: true });
}

function clearDetailAnimation() {
  clearTimeout(state.detailAnimTimer);
  els.detailInner?.classList.remove("detail-inner--animate");
  els.goalDetail?.classList.remove("is-fading");
}

function playDetailAnimations() {
  clearDetailAnimation();
  if (!motionOk || !els.detailInner) return;

  els.exerciseCards?.querySelectorAll(".exercise-card").forEach((card, i) => {
    card.style.animationDelay = `${0.28 + Math.min(i, 8) * 0.04}s`;
  });

  requestAnimationFrame(() => {
    els.detailInner.classList.add("detail-inner--animate");
    state.detailAnimTimer = window.setTimeout(() => {
      els.detailInner?.classList.remove("detail-inner--animate");
    }, 900);
  });
}

function popBadge() {
  if (!motionOk) return;
  els.goalCount?.classList.remove("badge--pop");
  requestAnimationFrame(() => els.goalCount?.classList.add("badge--pop"));
}

function resetScrollReveal() {
  state.lastReveal = -1;
  if (els.detailPanel) els.detailPanel.scrollTop = 0;
  scheduleScrollReveal();
}

function setDetailLoading(on) {
  state.loading = on;
  if (!els.detailLoading) return;
  els.detailLoading.hidden = !on;
  els.goalDetail?.classList.toggle("is-loading", on);
}

function showGoalSkeletons() {
  els.goalList.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const li = document.createElement("li");
    li.className = "skeleton skeleton--item";
    els.goalList.appendChild(li);
  }
}

async function loadGoalStatsMap() {
  try {
    const { dtoOut } = await stats.overview();
    state.goalStats.clear();
    for (const row of dtoOut.byFitnessGoal ?? []) {
      state.goalStats.set(row.fitnessGoalId, {
        count: row.exerciseCount,
        reps: row.sessionRepetitions,
        duration: row.durationMinutes,
      });
    }
  } catch {
  }
}

async function refreshGoals() {
  showGoalSkeletons();
  const [{ dtoOut }, _] = await Promise.all([fitnessGoals.list(), loadGoalStatsMap()]);
  state.goals = [...dtoOut.fitnessGoalList].sort((a, b) =>
    a.name.localeCompare(b.name, "cs"),
  );
  renderGoalList(true);
  els.goalCount.textContent = String(state.goals.length);
  popBadge();
}

function filteredGoals() {
  const q = state.search.trim().toLowerCase();
  if (!q) return state.goals;
  return state.goals.filter((g) => g.name.toLowerCase().includes(q));
}

function renderGoalList(animateList = false) {
  const list = filteredGoals();
  els.goalList.innerHTML = "";
  els.goalList.classList.toggle("goal-list--animate", animateList && motionOk);

  if (list.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-inline";
    li.style.padding = "1.25rem 0.5rem";
    li.textContent = state.search ? "Žádný cíl neodpovídá hledání." : "Zatím žádné cíle.";
    els.goalList.appendChild(li);
    return;
  }

  list.forEach((goal, index) => {
    const meta = state.goalStats.get(goal.id);
    const count = meta?.count ?? 0;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "goal-item" + (goal.id === state.selectedId ? " is-active" : "");
    if (animateList && motionOk) {
      btn.style.animationDelay = `${Math.min(index, 12) * 0.04}s`;
    }
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", goal.id === state.selectedId ? "true" : "false");
    btn.innerHTML = `
      <span class="avatar">${escapeHtml(initials(goal.name))}</span>
      <span class="goal-item__body">
        <span class="goal-item__name">${escapeHtml(goal.name)}</span>
        <span class="goal-item__sub">${count} cvičení</span>
      </span>
      <span class="goal-item__meta">${count}</span>
    `;
    btn.addEventListener("click", () => selectGoal(goal.id));
    const li = document.createElement("li");
    li.appendChild(btn);
    els.goalList.appendChild(li);
  });
}

async function selectGoal(id) {
  if (state.selectedId === id && !state.loading) return;
  const isSwitch = state.selectedId != null && state.selectedId !== id;

  clearDetailAnimation();
  state.valueAnimGen++;

  if (isSwitch && motionOk) {
    els.goalDetail.classList.add("is-fading");
    await new Promise((r) => setTimeout(r, 160));
    els.goalDetail.classList.remove("is-fading");
  }

  state.selectedId = id;
  renderGoalList(false);

  const goal = state.goals.find((g) => g.id === id);
  if (!goal) return;

  els.emptyState.hidden = true;
  els.goalDetail.hidden = false;

  if (motionOk) {
    requestAnimationFrame(() => {
      els.goalList.querySelector(".goal-item.is-active")?.classList.add("goal-item--pulse");
    });
  }

  els.breadcrumbs.innerHTML = `
    <button type="button" class="linkish" data-nav="list">Fitness cíle</button>
    &rsaquo; <strong>${escapeHtml(goal.name)}</strong>
  `;
  els.breadcrumbs.querySelector("[data-nav]")?.addEventListener("click", clearSelection);

  els.goalTitle.textContent = goal.name;
  els.goalAvatar.textContent = initials(goal.name);
  els.goalIdShort.textContent = shortId(goal.id);
  resetScrollReveal();

  setDetailLoading(true);
  try {
    await loadExercisesForGoal(id);
  } finally {
    setDetailLoading(false);
    requestAnimationFrame(() => {
      playDetailAnimations();
      scheduleScrollReveal();
    });
  }
}

async function loadExercisesForGoal(goalId) {
  const { dtoOut } = await exercises.listByGoal(goalId);
  state.exercises = dtoOut.exerciseList;

  const { count, reps, duration, lastDate } = computeGoalStats(state.exercises);
  state.goalStats.set(goalId, { count, reps, duration });

  els.goalLastActivity.textContent = lastDate ? formatDateRelative(lastDate).label : "—";
  animateValue(els.statExercises, count);
  animateValue(els.statReps, reps);
  els.statDuration.textContent =
    duration > 0 ? `${duration.toLocaleString("cs-CZ")} min` : "—";

  const hasRows = state.exercises.length > 0;
  const countLabel =
    state.exercises.length === 1
      ? "1 záznam"
      : state.exercises.length >= 2 && state.exercises.length <= 4
        ? `${state.exercises.length} záznamy`
        : `${state.exercises.length} záznamů`;

  els.exerciseCards.hidden = !hasRows;
  els.exerciseEmpty.hidden = hasRows;
  els.exerciseToolbar.hidden = !hasRows;
  if (els.exerciseToolbarCount) els.exerciseToolbarCount.textContent = countLabel;
  if (els.exerciseCount) {
    els.exerciseCount.textContent = hasRows ? ` · ${state.exercises.length}` : "";
  }

  els.exerciseCards.innerHTML = "";
  const sorted = [...state.exercises].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  sorted.forEach((ex, index) => {
    const rel = formatDateRelative(ex.date);
    const volume = ex.sets * ex.repetitions;
    const li = document.createElement("li");
    li.className = "exercise-card";
    li.innerHTML = `
      <span class="exercise-card__dot" aria-hidden="true"></span>
      <div class="exercise-card__main">
        <p class="exercise-card__name">${escapeHtml(ex.name)}</p>
        ${ex.note ? `<p class="exercise-card__note">${escapeHtml(ex.note)}</p>` : ""}
        <div class="exercise-card__tags">
          <span class="tag tag--volume">${ex.sets} × ${ex.repetitions} = ${volume}</span>
          ${ex.durationMinutes ? `<span class="tag tag--time">${ex.durationMinutes} min</span>` : ""}
        </div>
      </div>
      <div class="exercise-card__date">
        <strong>${escapeHtml(rel.label)}</strong>
        ${escapeHtml(rel.sub)}
      </div>
      <div class="exercise-card__actions">
        <button type="button" class="btn btn--ghost btn--sm" data-edit>Upravit</button>
        <button type="button" class="btn btn--danger-ghost btn--sm" data-del>Smazat</button>
      </div>
    `;
    li.querySelector("[data-edit]")?.addEventListener("click", () => openExerciseModal(ex));
    li.querySelector("[data-del]")?.addEventListener("click", () =>
      removeExercise(ex.id, ex.name),
    );
    els.exerciseCards.appendChild(li);
  });

  renderGoalList(false);
}

function clearSelection() {
  clearDetailAnimation();
  state.selectedId = null;
  setDetailLoading(false);
  els.goalDetail.hidden = true;
  els.emptyState.hidden = false;
  renderGoalList(false);
}

function updateVolumeHint() {
  const f = els.exerciseForm;
  const sets = Math.max(1, Number(f.sets.value) || 1);
  const reps = Math.max(1, Number(f.repetitions.value) || 1);
  const total = sets * reps;
  els.volumeHint.innerHTML = `Objem: ${sets} × ${reps} = <strong>${total.toLocaleString("cs-CZ")}</strong> opakování`;
}

function setSubmitLoading(form, loading) {
  const btn = form.querySelector("[data-submit]");
  if (!btn) return;
  btn.disabled = loading;
  btn.classList.toggle("btn--loading", loading);
}

function openGoalModal(editGoal = null) {
  state.editingGoalId = editGoal?.id ?? null;
  els.goalModalTitle.textContent = editGoal ? "Upravit fitness cíl" : "Nový fitness cíl";
  els.goalForm.name.value = editGoal?.name ?? "";
  els.goalModal.showModal();
  els.goalForm.name.focus();
}

function openExerciseModal(exercise = null) {
  if (!state.selectedId) return;
  state.editingExerciseId = exercise?.id ?? null;
  els.exerciseModalTitle.textContent = exercise ? "Upravit cvičení" : "Nové cvičení";
  const f = els.exerciseForm;
  f.name.value = exercise?.name ?? "";
  f.sets.value = exercise?.sets ?? 3;
  f.repetitions.value = exercise?.repetitions ?? 10;
  f.note.value = exercise?.note ?? "";
  f.durationMinutes.value = exercise?.durationMinutes ?? "";
  f.date.value = exercise
    ? toDatetimeLocalValue(exercise.date)
    : toDatetimeLocalValue(new Date().toISOString());
  updateVolumeHint();
  els.exerciseModal.showModal();
  f.name.focus();
}

function confirmAction({ title, text, confirmLabel = "Odstranit", danger = true }) {
  return new Promise((resolve) => {
    els.confirmTitle.textContent = title;
    els.confirmText.textContent = text;
    els.confirmOk.textContent = confirmLabel;
    els.confirmOk.className = danger ? "btn btn--danger" : "btn btn--primary";

    const done = (ok) => {
      els.confirmModal.close();
      els.confirmOk.removeEventListener("click", onOk);
      els.confirmCancel.removeEventListener("click", onCancel);
      els.confirmModal.removeEventListener("cancel", onCancel);
      resolve(ok);
    };
    const onOk = () => done(true);
    const onCancel = () => done(false);

    els.confirmOk.addEventListener("click", onOk);
    els.confirmCancel.addEventListener("click", onCancel);
    els.confirmModal.addEventListener("cancel", onCancel, { once: true });
    els.confirmModal.showModal();
  });
}

function wireModals() {
  for (const dialog of [els.goalModal, els.exerciseModal]) {
    dialog.querySelectorAll('[data-action="cancel"]').forEach((btn) => {
      btn.addEventListener("click", () => dialog.close());
    });
  }

  els.exerciseForm.sets.addEventListener("input", updateVolumeHint);
  els.exerciseForm.repetitions.addEventListener("input", updateVolumeHint);

  els.goalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = els.goalForm.name.value.trim();
    if (!name) return;
    setSubmitLoading(els.goalForm, true);
    try {
      if (state.editingGoalId) {
        await fitnessGoals.update(state.editingGoalId, name);
        showToast("Cíl byl upraven.");
        els.goalModal.close();
        await refreshGoals();
        if (state.selectedId === state.editingGoalId) await selectGoal(state.selectedId);
      } else {
        const { dtoOut } = await fitnessGoals.create(name);
        showToast("Nový cíl byl vytvořen.");
        els.goalModal.close();
        await refreshGoals();
        await selectGoal(dtoOut.id);
      }
    } catch (err) {
      showToast(err.message || "Uložení se nezdařilo.", true);
    } finally {
      setSubmitLoading(els.goalForm, false);
    }
  });

  els.exerciseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!state.selectedId) return;
    const f = els.exerciseForm;
    const dtoIn = {
      name: f.name.value.trim(),
      sets: Number(f.sets.value),
      repetitions: Number(f.repetitions.value),
      date: datetimeLocalToIso(f.date.value),
      fitnessGoalId: state.selectedId,
    };
    const note = f.note.value.trim();
    if (note) dtoIn.note = note;
    const dm = f.durationMinutes.value;
    if (dm) dtoIn.durationMinutes = Number(dm);

    setSubmitLoading(els.exerciseForm, true);
    try {
      if (state.editingExerciseId) {
        dtoIn.id = state.editingExerciseId;
        await exercises.update(dtoIn);
        showToast("Cvičení bylo upraveno.");
      } else {
        await exercises.create(dtoIn);
        showToast("Cvičení bylo přidáno.");
      }
      els.exerciseModal.close();
      await loadExercisesForGoal(state.selectedId);
      await loadGoalStatsMap();
      playDetailAnimations();
    } catch (err) {
      showToast(err.message || "Uložení se nezdařilo.", true);
    } finally {
      setSubmitLoading(els.exerciseForm, false);
    }
  });
}

async function removeGoal() {
  if (!state.selectedId) return;
  const goal = state.goals.find((g) => g.id === state.selectedId);
  if (!goal) return;
  const ok = await confirmAction({
    title: "Odstranit fitness cíl?",
    text: `Cíl „${goal.name}" a všechna navázaná cvičení budou trvale smazána.`,
  });
  if (!ok) return;
  try {
    await fitnessGoals.remove(state.selectedId);
    showToast("Cíl byl odstraněn.");
    clearSelection();
    await refreshGoals();
  } catch (err) {
    showToast(err.message || "Odstranění se nezdařilo.", true);
  }
}

async function removeExercise(id, name) {
  const ok = await confirmAction({
    title: "Smazat cvičení?",
    text: `Záznam „${name}" bude trvale odstraněn.`,
  });
  if (!ok) return;
  try {
    await exercises.remove(id);
    showToast("Cvičení bylo smazáno.");
    if (state.selectedId) {
      await loadExercisesForGoal(state.selectedId);
      await loadGoalStatsMap();
      playDetailAnimations();
    }
  } catch (err) {
    showToast(err.message || "Smazání se nezdařilo.", true);
  }
}

function wireEvents() {
  $("#btnNewGoal").addEventListener("click", () => openGoalModal());
  $("#btnEmptyNewGoal").addEventListener("click", () => openGoalModal());
  $("#btnEditGoal").addEventListener("click", () => {
    const g = state.goals.find((x) => x.id === state.selectedId);
    if (g) openGoalModal(g);
  });
  $("#btnDeleteGoal").addEventListener("click", removeGoal);
  $("#btnAddExercise").addEventListener("click", () => openExerciseModal());
  $("#btnEmptyAddExercise").addEventListener("click", () => openExerciseModal());
  els.goalSearch.addEventListener("input", () => {
    state.search = els.goalSearch.value;
    renderGoalList(true);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      openGoalModal();
    }
  });
}

async function init() {
  wireModals();
  wireEvents();
  wireScrollReveal();
  document.body.classList.add("app-ready");
  try {
    await refreshGoals();
    if (state.goals.length > 0) await selectGoal(state.goals[0].id);
    scheduleScrollReveal();
  } catch (err) {
    showToast("Nepodařilo se načíst data z API. Běží server?", true);
    els.goalList.innerHTML = "";
    console.error(err);
  }
}

init();
