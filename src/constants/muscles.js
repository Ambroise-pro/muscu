export const MUSCLE_ZONES = [
  {
    label: "Membres sup",
    muscles: ["Biceps", "Triceps", "Deltoides", "Trapèzes", "Avant bras"]
  },
  {
    label: "Tronc",
    muscles: ["Pectoraux", "Abdominaux", "Dorsaux", "Lombaires"]
  },
  {
    label: "Membres inférieurs",
    muscles: ["Quadriceps", "Ischio jambier", "Fessiers", "Adducteurs", "Abducteurs", "Mollets"]
  }
];

export const MUSCLE_GROUPS = MUSCLE_ZONES.flatMap((zone) => zone.muscles);

export const MUSCLE_IMAGE_FILES = {
  "Biceps": "biceps.svg",
  "Triceps": "triceps.svg",
  "Deltoides": "deltoides.svg",
  "Trapèzes": "trapezes.svg",
  "Avant bras": "avant-bras.svg",
  "Pectoraux": "pectoraux.svg",
  "Abdominaux": "abdominaux.svg",
  "Dorsaux": "dorsaux.svg",
  "Lombaires": "lombaires.svg",
  "Quadriceps": "quadriceps.svg",
  "Ischio jambier": "ischio-jambier.svg",
  "Fessiers": "fessiers.svg",
  "Adducteurs": "adducteurs.svg",
  "Abducteurs": "abducteurs.svg",
  "Mollets": "mollets.svg"
};

export const SMALL_MUSCLES = [
  "Trapèzes",
  "Deltoides",
  "Triceps",
  "Biceps",
  "Avant bras",
  "Abdominaux",
  "Mollets"
];

export const MUSCLE_SHORT = {
  "Biceps": "BI",
  "Triceps": "TR",
  "Deltoides": "DE",
  "Trapèzes": "TZ",
  "Avant bras": "AB",
  "Pectoraux": "PE",
  "Abdominaux": "AD",
  "Dorsaux": "DO",
  "Lombaires": "LO",
  "Quadriceps": "QU",
  "Ischio jambier": "IJ",
  "Fessiers": "FE",
  "Adducteurs": "AC",
  "Abducteurs": "AX",
  "Mollets": "MO"
};
export const MUSCLE_LONG = Object.fromEntries(Object.entries(MUSCLE_SHORT).map(([k, v]) => [v, k]));
