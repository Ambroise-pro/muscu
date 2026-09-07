import { createElement } from 'react';
import { Zap, Layers, BarChart2 } from 'lucide-react';

export const TECH_GUIDE_ENABLED = false;

export const EXERCISES_DATABASE = {
  "Trapèzes": ["Shrugs Haltères", "Shrugs Barre", "Rowing Menton", "Farmer Walk"],
  "Deltoides": ["Développé Militaire", "Élévations Latérales", "Élévations Frontales", "Oiseau"],
  "Pectoraux": ["Développé Couché", "Développé Incliné", "Écartés Haltères", "Dips (Pecs)"],
  "Triceps": ["Extensions Poulie", "Barre au front", "Dips (Triceps)", "Développé Couché Serré"],
  "Biceps": ["Curl Barre", "Curl Haltères", "Curl Marteau", "Curl Pupitre"],
  "Avant bras": ["Curl Inversé", "Flexion Poignet", "Extension Poignet", "Farmer Walk"],
  "Dorsaux": ["Tractions", "Tirage Poitrine", "Tirage Horizontal", "Rowing Barre"],
  "Abdominaux": ["Crunch Lesté", "Relevé de jambes", "Gainage", "Gainage Dynamique"],
  "Lombaires": ["Extensions Lombaires", "Good Morning", "Soulevé de Terre", "Superman"],
  "Fessiers": ["Hip Thrust", "Pont Fessier", "Kickback Câble", "Squat"],
  "Quadriceps": ["Squat", "Presse à cuisses", "Leg Extension", "Fentes"],
  "Ischio jambier": ["Leg Curl", "Soulevé de Terre Jambes Tendues", "Hip Thrust"],
  "Adducteurs": ["Adducteur Machine", "Fentes Latérales", "Copenhagen Plank"],
  "Abducteurs": ["Abducteur Machine", "Marche Latérale", "Kickback Câble"],
  "Mollets": ["Mollets Debout", "Mollets Assis", "Mollets Presse"]
};

export const SESSION_GOALS = {
  tonification: { label: "Tonification", icon: createElement(Zap, { size: 18 }), defaultRest: 45, desc: "Reps élevées, repos court" },
  volume: { label: "Volume", icon: createElement(Layers, { size: 18 }), defaultRest: 90, desc: "Hypertrophie standard" },
  puissance: { label: "Puissance", icon: createElement(BarChart2, { size: 18 }), defaultRest: 180, desc: "Force max, repos long" }
};

export const WORK_PATTERNS = {
  constant: {
    label: "Poids constant",
    desc: "Même charge et même reps sur toutes les séries."
  },
  pyramid_up: {
    label: "Pyramidal montant",
    desc: "Charge qui monte, reps qui baissent."
  },
  pyramid_down: {
    label: "Pyramidal descendant",
    desc: "Charge qui baisse, reps qui montent."
  },
  wave: {
    label: "Ondulatoire",
    desc: "Alternance de charge/répétitions d'une série à l'autre."
  }
};

// Règles de validation physiologique
export const GOAL_RULES = {
  tonification: {
    minReps: 15, maxReps: 25,
    minInt: 40, maxInt: 60,
    minSets: 4, maxSets: 6,
    minRest: 30, maxRest: 60,
    minSpeed: 20, maxSpeed: 45,
    speed: "20-45 sec",
    recovery: "30 sec à 1 min",
    advice: "Tonification : 4-6 séries, 15-25 reps, 40-60% intensité. Vitesse 20-45 sec, récup 30 sec à 1 min."
  },
  volume: {
    minReps: 8, maxReps: 15,
    minInt: 60, maxInt: 80,
    minSets: 5, maxSets: 7,
    minRest: 60, maxRest: 120,
    minSpeed: 10, maxSpeed: 30,
    speed: "10-30 sec",
    recovery: "2 min",
    advice: "Volume : 5-7 séries, 8-15 reps, 60-80% intensité. Vitesse 10-30 sec, récup 2 min."
  },
  puissance: {
    minReps: 4, maxReps: 8,
    minInt: 80, maxInt: 90,
    minSets: 3, maxSets: 5,
    minRest: 120, maxRest: 300,
    minSpeed: 6, maxSpeed: 10,
    speed: "6-10 sec",
    recovery: "3 à 5 min",
    advice: "Puissance : 3-5 séries, 4-8 reps, 80-90% intensité. Vitesse 6-10 sec, récup 3 à 5 min."
  }
};

export const MUSCLE_TECHNIQUE_GUIDES = {
  "Biceps": {
    consignes: ["Coude fixe près du corps.", "Amplitude complète sans élan."],
    erreurs: ["Balancement du buste.", "Poignets cassés en fin de mouvement."],
    securite: ["Charge progressive.", "Ne pas verrouiller brutalement le coude."],
    varianteFacile: "Curl assis haltères légers.",
    varianteDifficile: "Curl pupitre tempo lent."
  },
  "Triceps": {
    consignes: ["Garder les coudes orientés vers l'avant.", "Contrôler la phase de descente."],
    erreurs: ["Écarter les coudes.", "Perdre la neutralité lombaire."],
    securite: ["Éviter les charges trop lourdes au-dessus de la tête.", "Utiliser un pareur sur barre au front."],
    varianteFacile: "Extension poulie corde légère.",
    varianteDifficile: "Développé couché prise serrée."
  },
  "Pectoraux": {
    consignes: ["Omoplates serrées.", "Pieds ancrés au sol."],
    erreurs: ["Rebond de barre sur la poitrine.", "Amplitude tronquée."],
    securite: ["Pareur recommandé.", "Stop disques obligatoires."],
    varianteFacile: "Pompes inclinées.",
    varianteDifficile: "Développé couché pause 1 seconde."
  },
  "Dorsaux": {
    consignes: ["Tirer avec les coudes.", "Garder le thorax ouvert."],
    erreurs: ["Dos arrondi.", "Traction à l'élan."],
    securite: ["Charge adaptée à la posture.", "Contrôle sur la phase négative."],
    varianteFacile: "Tirage horizontal guidé.",
    varianteDifficile: "Tractions lestées."
  },
  "Quadriceps": {
    consignes: ["Genoux dans l'axe des pieds.", "Descente contrôlée."],
    erreurs: ["Talons qui décollent.", "Valgus des genoux."],
    securite: ["Échauffement genou/hanche.", "Commencer à vide."],
    varianteFacile: "Goblet squat.",
    varianteDifficile: "Front squat."
  }
};

export const DEFAULT_TECHNIQUE_GUIDE = {
  consignes: ["Contrôler le mouvement du début à la fin.", "Conserver une posture stable et respirer."],
  erreurs: ["Élan excessif.", "Amplitude incomplète."],
  securite: ["Charge progressive.", "Arrêter en cas de douleur anormale."],
  varianteFacile: "Version guidée à charge légère.",
  varianteDifficile: "Tempo lent ou charge modérée supérieure."
};
