const STORAGE_KEY = 'nuitDuSportData';
const ADMIN_SESSION_KEY = 'nuitDuSportAdminUnlocked';

const DEFAULT_DATA = {
  activites: [
    { id: 'act-escalade', nom: 'Escalade', description: 'Chaque voie montée = 10 m. Objectif collectif : atteindre la hauteur du Mont Blanc !' },
    { id: 'act-raquette', nom: 'Sports de raquette', description: "Objectif collectif : jouer autant de matchs qu'à Roland Garros !" },
    { id: 'act-laserrun', nom: 'Laser Run', description: 'Course continue : qui tiendra le plus longtemps et parcourra la plus grande distance ?' },
    { id: 'act-danse', nom: 'Danse', description: "Qui dansera le plus longtemps sans s'arrêter ?" },
    { id: 'act-golf', nom: 'Golf', description: 'Qui frappera le plus de balles ?' },
  ],
  typesRecord: [
    {
      id: 'type-escalade-voies',
      activiteId: 'act-escalade',
      nom: 'Voies montées vers le Mont Blanc',
      mode: 'cumul',
      uniteSaisie: 'voies',
      unite: 'm',
      multiplicateur: 10,
      objectif: 4810,
      sens: 'plus_haut',
    },
    {
      id: 'type-raquette-matchs',
      activiteId: 'act-raquette',
      nom: 'Matchs joués (objectif Roland Garros)',
      mode: 'cumul',
      uniteSaisie: 'matchs',
      unite: 'matchs',
      multiplicateur: 1,
      objectif: 127,
      sens: 'plus_haut',
    },
    {
      id: 'type-laserrun-temps',
      activiteId: 'act-laserrun',
      nom: 'Temps de course sans interruption',
      mode: 'record',
      uniteSaisie: 'minutes',
      unite: 'minutes',
      multiplicateur: 1,
      objectif: null,
      sens: 'plus_haut',
    },
    {
      id: 'type-laserrun-distance',
      activiteId: 'act-laserrun',
      nom: 'Distance parcourue',
      mode: 'record',
      uniteSaisie: 'tours',
      unite: 'm',
      multiplicateur: 400,
      objectif: null,
      sens: 'plus_haut',
    },
    {
      id: 'type-danse-temps',
      activiteId: 'act-danse',
      nom: 'Temps dansé sans interruption',
      mode: 'record',
      uniteSaisie: 'minutes',
      unite: 'minutes',
      multiplicateur: 1,
      objectif: null,
      sens: 'plus_haut',
    },
    {
      id: 'type-golf-balles',
      activiteId: 'act-golf',
      nom: 'Balles frappées',
      mode: 'record',
      uniteSaisie: 'balles',
      unite: 'balles',
      multiplicateur: 1,
      objectif: null,
      sens: 'plus_haut',
    },
  ],
  contributions: [],
  planning: [],
  admin: {
    motDePasse: null,
  },
};

function deepClone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function generateId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepClone(DEFAULT_DATA);
    const parsed = JSON.parse(raw);
    return {
      activites: Array.isArray(parsed.activites) ? parsed.activites : [],
      typesRecord: Array.isArray(parsed.typesRecord) ? parsed.typesRecord : [],
      contributions: Array.isArray(parsed.contributions) ? parsed.contributions : [],
      planning: Array.isArray(parsed.planning) ? parsed.planning : [],
      admin: { ...DEFAULT_DATA.admin, ...parsed.admin },
    };
  } catch (error) {
    console.error('Impossible de charger les données', error);
    return deepClone(DEFAULT_DATA);
  }
}

const state = {
  data: loadData(),
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

// Activités -------------------------------------------------------------

export function getActivites() {
  return state.data.activites;
}

export function addActivite({ nom, description }) {
  const activite = { id: generateId('act'), nom, description: description || '' };
  state.data.activites.push(activite);
  save();
  return activite;
}

export function updateActivite(id, { nom, description }) {
  const activite = state.data.activites.find((a) => a.id === id);
  if (!activite) return;
  activite.nom = nom;
  activite.description = description || '';
  save();
}

export function deleteActivite(id) {
  state.data.activites = state.data.activites.filter((a) => a.id !== id);
  const typesToRemove = state.data.typesRecord.filter((t) => t.activiteId === id).map((t) => t.id);
  state.data.typesRecord = state.data.typesRecord.filter((t) => t.activiteId !== id);
  state.data.contributions = state.data.contributions.filter(
    (c) => !typesToRemove.includes(c.typeRecordId),
  );
  save();
}

// Types de record ---------------------------------------------------------

export function getTypesRecord(activiteId) {
  if (!activiteId) return state.data.typesRecord;
  return state.data.typesRecord.filter((t) => t.activiteId === activiteId);
}

export function getTypeRecord(id) {
  return state.data.typesRecord.find((t) => t.id === id);
}

export function addTypeRecord({ activiteId, nom, mode, uniteSaisie, unite, multiplicateur, sens, objectif }) {
  const typeRecord = {
    id: generateId('type'),
    activiteId,
    nom,
    mode: mode === 'cumul' ? 'cumul' : 'record',
    uniteSaisie: uniteSaisie || unite,
    unite,
    multiplicateur: Number(multiplicateur) > 0 ? Number(multiplicateur) : 1,
    sens: sens === 'plus_bas' ? 'plus_bas' : 'plus_haut',
    objectif: mode === 'cumul' && Number(objectif) > 0 ? Number(objectif) : null,
  };
  state.data.typesRecord.push(typeRecord);
  save();
  return typeRecord;
}

export function deleteTypeRecord(id) {
  state.data.typesRecord = state.data.typesRecord.filter((t) => t.id !== id);
  state.data.contributions = state.data.contributions.filter((c) => c.typeRecordId !== id);
  save();
}

// Contributions / records --------------------------------------------------

function estMeilleur(valeur, record, sens) {
  if (!record) return true;
  return sens === 'plus_bas' ? valeur < record.valeur : valeur > record.valeur;
}

export function getValeurAffichee(contribution, typeRecord) {
  const type = typeRecord || getTypeRecord(contribution.typeRecordId);
  return contribution.valeur * (type?.multiplicateur || 1);
}

export function getRecordActuel(typeRecordId) {
  const contributions = state.data.contributions.filter((c) => c.typeRecordId === typeRecordId);
  if (!contributions.length) return null;
  const typeRecord = getTypeRecord(typeRecordId);
  const sens = typeRecord?.sens || 'plus_haut';
  return contributions.reduce((meilleur, courant) => {
    if (!meilleur) return courant;
    return estMeilleur(courant.valeur, meilleur, sens) ? courant : meilleur;
  }, null);
}

export function getTotalCumule(typeRecordId) {
  const typeRecord = getTypeRecord(typeRecordId);
  const multiplicateur = typeRecord?.multiplicateur || 1;
  return state.data.contributions
    .filter((c) => c.typeRecordId === typeRecordId)
    .reduce((total, c) => total + c.valeur * multiplicateur, 0);
}

export function addContribution({ typeRecordId, valeur }) {
  const typeRecord = getTypeRecord(typeRecordId);
  if (!typeRecord) return null;

  let nouveauRecord = false;
  let objectifAtteint = false;

  if (typeRecord.mode === 'cumul') {
    const totalAvant = getTotalCumule(typeRecordId);
    const totalApres = totalAvant + valeur * typeRecord.multiplicateur;
    objectifAtteint = Boolean(typeRecord.objectif) && totalAvant < typeRecord.objectif && totalApres >= typeRecord.objectif;
  } else {
    const recordAvant = getRecordActuel(typeRecordId);
    nouveauRecord = estMeilleur(valeur, recordAvant, typeRecord.sens);
  }

  const contribution = {
    id: generateId('contrib'),
    typeRecordId,
    valeur,
    date: new Date().toISOString(),
    nouveauRecord,
    objectifAtteint,
  };
  state.data.contributions.push(contribution);
  save();
  return contribution;
}

export function getFluxContributions(limite = 30) {
  return [...state.data.contributions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limite);
}

// Planning ------------------------------------------------------------------

export function getPlanning() {
  return [...state.data.planning].sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function addEvenementPlanning({ date, titre, lieu, description }) {
  const evenement = {
    id: generateId('evt'),
    date,
    titre,
    lieu: lieu || '',
    description: description || '',
  };
  state.data.planning.push(evenement);
  save();
  return evenement;
}

export function deleteEvenementPlanning(id) {
  state.data.planning = state.data.planning.filter((e) => e.id !== id);
  save();
}

// Admin ----------------------------------------------------------------------

export function adminMotDePasseDefini() {
  return Boolean(state.data.admin.motDePasse);
}

export function definirMotDePasseAdmin(motDePasse) {
  state.data.admin.motDePasse = motDePasse;
  save();
}

export function verifierMotDePasseAdmin(motDePasse) {
  return state.data.admin.motDePasse === motDePasse;
}

export function deverrouillerAdmin() {
  sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
}

export function verrouillerAdmin() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function adminEstDeverrouille() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}
