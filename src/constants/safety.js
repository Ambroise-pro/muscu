import { createElement } from 'react';
import { Hand, Users, ShieldAlert, Shield, Clock, HeartPulse, CheckCircle } from 'lucide-react';

export const SAFETY_TITLE = "REGLES DE FONCTIONNEMENT EN SALLE DE MUSCULATION";

export const SAFETY_SECTION_ICONS = {
  "JE RESPECTE LE MATERIEL MIS À MA DISPOSITION": createElement(Hand, { size: 14 }),
  "JE RESPECTE LE TRAVAIL DES AUTRES": createElement(Users, { size: 14 }),
  "JE PRETE ATTENTION A MA SECURITE": createElement(ShieldAlert, { size: 14 }),
  "JE PRETE ATTENTION A LA SECURITE D’AUTRUI": createElement(Shield, { size: 14 })
};

export const SAFETY_SUBSECTION_ICONS = {
  "Avant l’effort": createElement(Clock, { size: 14 }),
  "Pendant l’effort": createElement(HeartPulse, { size: 14 }),
  "Après l’effort": createElement(CheckCircle, { size: 14 })
};

export const SAFETY_SECTIONS = [
  {
    heading: "JE RESPECTE LE MATERIEL MIS À MA DISPOSITION",
    items: [
      "J’utilise l’atelier pour les fonctions qui lui sont attribuées.",
      "Je range obligatoirement les charges, les barres, les stop disques.",
      "J’utilise une serviette sur les appareils."
    ]
  },
  {
    heading: "JE RESPECTE LE TRAVAIL DES AUTRES",
    items: [
      "Je ne perturbe pas un partenaire qui travaille."
    ]
  },
  {
    heading: "JE PRETE ATTENTION A MA SECURITE",
    subsections: [
      {
        heading: "Avant l’effort",
        items: [
          "Je m’échauffe correctement (course lente, corde à sauter, mobilisations articulaires, répétitions avec barre à vide).",
          "Je suis vigilant dans mes déplacements.",
          "Je suis vigilant dans la manipulation des charges.",
          "Je m’oblige à lire la fiche explicative avant de réaliser un atelier, particulièrement s’il m’est inconnu.",
          "Je sécurise l’atelier avec la pose obligatoire des stop disques."
        ]
      },
      {
        heading: "Pendant l’effort",
        items: [
          "Je respecte les consignes propres à chaque atelier.",
          "Je verrouille la prise de barre avec le pouce.",
          "Je contrôle la charge du début (prise en main) à la fin (ce qui se traduit par l’absence de bruits de plaques, de disques s’entrechoquant).",
          "Je suis le programme proposé dans la mesure de mes capacités.",
          "J’arrête la pratique en cas de douleur anormale."
        ]
      },
      {
        heading: "Après l’effort",
        items: [
          "Je récupère suffisamment : je bois de l’eau, je m’étire entre les séries et à la fin de la séance."
        ]
      }
    ]
  },
  {
    heading: "JE PRETE ATTENTION A LA SECURITE D’AUTRUI",
    items: [
      "Je travaille toujours à deux sur un atelier, ce qui implique :",
      "de se concentrer : je ne dois jamais perdre de vue l’exécutant, et en aucun cas lui tourner le dos ;",
      "de se placer : je dois conserver un positionnement adéquat, proche de l’exécutant et de la charge, pour intervenir en cas de nécessité, tout en préservant mon intégrité physique (conserver un dos droit) ;",
      "d’intervenir : il s’agit de réagir de manière appropriée en soulageant le pratiquant des kilos qui posent problème. Je ne prends pas la barre des mains du pratiquant.",
      "De conseiller : je corrige et dois faire arrêter la pratique si des erreurs importantes sont constatées."
    ]
  }
];
