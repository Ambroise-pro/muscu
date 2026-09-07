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
  "Biceps": "biceps.png",
  "Triceps": "triceps.png",
  "Deltoides": "deltoides.png",
  "Trapèzes": "trapezes.png",
  "Avant bras": "avant-bras.png",
  "Pectoraux": "pectoraux.png",
  "Abdominaux": "abdominaux.png",
  "Dorsaux": "dorsaux.png",
  "Lombaires": "lombaires.png",
  "Quadriceps": "quadriceps.png",
  "Ischio jambier": "ischio-jambiers.png",
  "Fessiers": "fessiers.png",
  "Adducteurs": "adducteurs.png",
  "Abducteurs": "abducteurs.png",
  "Mollets": "mollets.png"
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
