const STORAGE_KEY = 'nuitDuSportData';
const ADMIN_SESSION_KEY = 'nuitDuSportAdminUnlocked';

const DEFAULT_DATA = {
  activites: [],
  typesRecord: [],
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

export function addTypeRecord({ activiteId, nom, unite, sens }) {
  const typeRecord = {
    id: generateId('type'),
    activiteId,
    nom,
    unite,
    sens: sens === 'plus_bas' ? 'plus_bas' : 'plus_haut',
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

export function addContribution({ typeRecordId, valeur }) {
  const typeRecord = getTypeRecord(typeRecordId);
  if (!typeRecord) return null;
  const recordAvant = getRecordActuel(typeRecordId);
  const nouveauRecord = estMeilleur(valeur, recordAvant, typeRecord.sens);
  const contribution = {
    id: generateId('contrib'),
    typeRecordId,
    valeur,
    date: new Date().toISOString(),
    nouveauRecord,
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
