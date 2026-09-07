import { MUSCLE_IMAGE_FILES } from '../constants/muscles';
import { GOAL_RULES, MUSCLE_TECHNIQUE_GUIDES, DEFAULT_TECHNIQUE_GUIDE } from '../constants/exercises';

export const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return "0:00";
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getMuscleImage = (muscle) => {
  const file = MUSCLE_IMAGE_FILES[muscle];
  if (file) return `${import.meta.env.BASE_URL}muscles/${file}`;
  return `${import.meta.env.BASE_URL}groupes.jpg`;
};

// Fonction de vérification d'un exercice par rapport à l'objectif
export const getValidationIssues = (item, goalKey) => {
  const rules = GOAL_RULES[goalKey];
  const issues = [];

  if (!rules) return issues;

  // Vérif Séries
  if (item.sets < rules.minSets || item.sets > rules.maxSets) {
    issues.push(`Séries (${item.sets}) hors cible (${rules.minSets}-${rules.maxSets})`);
  }

  // Vérif Reps
  if (item.reps < rules.minReps || item.reps > rules.maxReps) {
    issues.push(`Reps (${item.reps}) hors cible (${rules.minReps}-${rules.maxReps})`);
  }

  // Vérif Intensité (seulement si définie via 1RM)
  if (item.intensity) {
    if (item.intensity < rules.minInt || item.intensity > rules.maxInt) {
      issues.push(`Intensité (${item.intensity}%) inadaptée (${rules.minInt}-${rules.maxInt}%)`);
    }
  }

  return issues;
};

export const getExerciseGuide = (exerciseName, muscleName) => {
  return MUSCLE_TECHNIQUE_GUIDES[muscleName] || DEFAULT_TECHNIQUE_GUIDE;
};
