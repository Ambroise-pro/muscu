import { GOAL_RULES } from '../constants/exercises';

export const calculateBrzycki = (weight, reps) => {
  const w = parseFloat(weight);
  const r = parseFloat(reps);
  if (!w || !r || r <= 0) return 0;
  if (r === 1) return w;
  const rm = w / (1.0278 - (0.0278 * r));
  return Math.round(rm * 10) / 10;
};

export const getPatternStep = (pattern, index, totalSets) => {
  if (totalSets <= 1) return { weightFactor: 1, repsDelta: 0 };

  const ratio = index / (totalSets - 1);
  if (pattern === "pyramid_up") {
    return {
      weightFactor: 0.88 + (0.17 * ratio),
      repsDelta: Math.round(2 - (3 * ratio))
    };
  }
  if (pattern === "pyramid_down") {
    return {
      weightFactor: 1.05 - (0.17 * ratio),
      repsDelta: Math.round(-1 + (3 * ratio))
    };
  }
  if (pattern === "wave") {
    const weightWave = [0.9, 1, 0.94, 1.04, 0.92, 1.06];
    const repsWave = [2, 0, 1, -1, 2, -2];
    const mapIdx = Math.round((index / (totalSets - 1)) * (weightWave.length - 1));
    return { weightFactor: weightWave[mapIdx], repsDelta: repsWave[mapIdx] };
  }
  return { weightFactor: 1, repsDelta: 0 };
};

export const generateSeriesPlan = ({ pattern, sets, reps, baseWeight }) => {
  const safeSets = Math.max(1, parseInt(sets) || 1);
  const safeReps = Math.max(1, parseInt(reps) || 1);
  const parsedWeight = baseWeight !== null && baseWeight !== undefined && baseWeight !== ""
    ? Math.max(1, parseInt(baseWeight) || 0)
    : null;

  return Array.from({ length: safeSets }, (_, idx) => {
    const step = getPatternStep(pattern, idx, safeSets);
    const targetReps = Math.max(1, safeReps + step.repsDelta);
    const targetWeight = parsedWeight
      ? Math.max(1, Math.round(parsedWeight * step.weightFactor))
      : null;

    return {
      set: idx + 1,
      reps: targetReps,
      weight: targetWeight
    };
  });
};

export const getSetPrescription = (item, setNumber) => {
  if (Array.isArray(item?.seriesPlan) && item.seriesPlan[setNumber - 1]) {
    return item.seriesPlan[setNumber - 1];
  }
  return {
    set: setNumber,
    reps: parseInt(item?.reps) || 0,
    weight: item?.weight ?? null
  };
};

export const evaluateWorkTime = (workSeconds, goalKey) => {
  const rules = GOAL_RULES[goalKey];
  if (!rules || workSeconds === null || workSeconds === undefined) return null;

  if (workSeconds < rules.minSpeed) {
    return {
      status: "fast",
      label: "Trop rapide",
      message: `Objectif ${rules.speed}: ralentir le tempo.`,
      tone: "amber"
    };
  }
  if (workSeconds > rules.maxSpeed) {
    return {
      status: "slow",
      label: "Trop lent",
      message: `Objectif ${rules.speed}: accélérer un peu l'exécution.`,
      tone: "red"
    };
  }
  return {
    status: "ok",
    label: "Cohérent",
    message: `Temps cohérent avec l'objectif (${rules.speed}).`,
    tone: "emerald"
  };
};
