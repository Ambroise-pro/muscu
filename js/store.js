import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://smqtzvngfdfopjnpovrf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lgEd01Ugl6g5Ol2ZaIHeRg_5q6KkCxI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_SESSION_KEY = 'nuitDuSportAdminUnlocked';

const state = {
  data: {
    activites: [],
    typesRecord: [],
    contributions: [],
    planning: [],
    admin: { motDePasse: null },
  },
};

let changeListener = null;

export function onChange(listener) {
  changeListener = listener;
}

function notify() {
  changeListener?.();
}

function generateId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

// Mappers DB (snake_case) <-> JS (camelCase) ----------------------------------

function mapActivite(row) {
  return { id: row.id, nom: row.nom, description: row.description || '', visuel: row.visuel || null };
}

function mapTypeRecord(row) {
  return {
    id: row.id,
    activiteId: row.activite_id,
    nom: row.nom,
    mode: row.mode,
    uniteSaisie: row.unite_saisie,
    unite: row.unite,
    multiplicateur: Number(row.multiplicateur),
    sens: row.sens,
    objectif: row.objectif === null ? null : Number(row.objectif),
  };
}

function mapContribution(row) {
  return {
    id: row.id,
    typeRecordId: row.type_record_id,
    valeur: Number(row.valeur),
    date: row.date,
    nouveauRecord: row.nouveau_record,
    objectifAtteint: row.objectif_atteint,
  };
}

function mapEvenement(row) {
  return { id: row.id, date: row.date, titre: row.titre, lieu: row.lieu || '', description: row.description || '' };
}

// Chargement initial + temps réel ---------------------------------------------

export async function initStore() {
  const [activitesRes, typesRes, contributionsRes, planningRes, adminRes] = await Promise.all([
    supabase.from('activites').select('*').order('created_at', { ascending: true }),
    supabase.from('types_record').select('*').order('created_at', { ascending: true }),
    supabase.from('contributions').select('*'),
    supabase.from('planning').select('*'),
    supabase.from('admin').select('*').eq('id', 1).maybeSingle(),
  ]);

  if (activitesRes.error) throw activitesRes.error;
  if (typesRes.error) throw typesRes.error;
  if (contributionsRes.error) throw contributionsRes.error;
  if (planningRes.error) throw planningRes.error;
  if (adminRes.error) throw adminRes.error;

  state.data.activites = activitesRes.data.map(mapActivite);
  state.data.typesRecord = typesRes.data.map(mapTypeRecord);
  state.data.contributions = contributionsRes.data.map(mapContribution);
  state.data.planning = planningRes.data.map(mapEvenement);
  state.data.admin = { motDePasse: adminRes.data?.mot_de_passe || null };

  subscribeRealtime();
}

const mappers = {
  activites: mapActivite,
  typesRecord: mapTypeRecord,
  contributions: mapContribution,
  planning: mapEvenement,
};

const tableToKey = {
  activites: 'activites',
  types_record: 'typesRecord',
  contributions: 'contributions',
  planning: 'planning',
};

function handleChange(key, payload) {
  const mapper = mappers[key];
  const list = state.data[key];

  if (payload.eventType === 'DELETE') {
    state.data[key] = list.filter((item) => item.id !== payload.old.id);
  } else {
    const mapped = mapper(payload.new);
    const index = list.findIndex((item) => item.id === mapped.id);
    state.data[key] = index === -1
      ? [...list, mapped]
      : list.map((item, i) => (i === index ? mapped : item));
  }
  notify();
}

function handleAdminChange(payload) {
  if (payload.eventType === 'DELETE') return;
  state.data.admin = { motDePasse: payload.new.mot_de_passe || null };
  notify();
}

function subscribeRealtime() {
  const channel = supabase.channel('nuit-du-sport-changes');
  Object.entries(tableToKey).forEach(([table, key]) => {
    channel.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => handleChange(key, payload));
  });
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'admin' }, handleAdminChange);
  channel.subscribe();
}

// Activités -------------------------------------------------------------

export function getActivites() {
  return state.data.activites;
}

export async function addActivite({ nom, description }) {
  const id = generateId('act');
  const { data, error } = await supabase
    .from('activites')
    .insert({ id, nom, description: description || '' })
    .select()
    .single();
  if (error) throw error;
  const activite = mapActivite(data);
  state.data.activites = [...state.data.activites, activite];
  notify();
  return activite;
}

export async function updateActivite(id, { nom, description }) {
  const { data, error } = await supabase
    .from('activites')
    .update({ nom, description: description || '' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  const activite = mapActivite(data);
  state.data.activites = state.data.activites.map((a) => (a.id === id ? activite : a));
  notify();
  return activite;
}

export async function deleteActivite(id) {
  const { error } = await supabase.from('activites').delete().eq('id', id);
  if (error) throw error;
  const typesToRemove = state.data.typesRecord.filter((t) => t.activiteId === id).map((t) => t.id);
  state.data.activites = state.data.activites.filter((a) => a.id !== id);
  state.data.typesRecord = state.data.typesRecord.filter((t) => t.activiteId !== id);
  state.data.contributions = state.data.contributions.filter(
    (c) => !typesToRemove.includes(c.typeRecordId),
  );
  notify();
}

// Types de record ---------------------------------------------------------

export function getTypesRecord(activiteId) {
  if (!activiteId) return state.data.typesRecord;
  return state.data.typesRecord.filter((t) => t.activiteId === activiteId);
}

export function getTypeRecord(id) {
  return state.data.typesRecord.find((t) => t.id === id);
}

export async function addTypeRecord({ activiteId, nom, mode, uniteSaisie, unite, multiplicateur, sens, objectif }) {
  const id = generateId('type');
  const payload = {
    id,
    activite_id: activiteId,
    nom,
    mode: mode === 'cumul' ? 'cumul' : 'record',
    unite_saisie: uniteSaisie || unite,
    unite,
    multiplicateur: Number(multiplicateur) > 0 ? Number(multiplicateur) : 1,
    sens: sens === 'plus_bas' ? 'plus_bas' : 'plus_haut',
    objectif: mode === 'cumul' && Number(objectif) > 0 ? Number(objectif) : null,
  };
  const { data, error } = await supabase.from('types_record').insert(payload).select().single();
  if (error) throw error;
  const typeRecord = mapTypeRecord(data);
  state.data.typesRecord = [...state.data.typesRecord, typeRecord];
  notify();
  return typeRecord;
}

export async function deleteTypeRecord(id) {
  const { error } = await supabase.from('types_record').delete().eq('id', id);
  if (error) throw error;
  state.data.typesRecord = state.data.typesRecord.filter((t) => t.id !== id);
  state.data.contributions = state.data.contributions.filter((c) => c.typeRecordId !== id);
  notify();
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

export async function addContribution({ typeRecordId, valeur }) {
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

  const id = generateId('contrib');
  const payload = {
    id,
    type_record_id: typeRecordId,
    valeur,
    nouveau_record: nouveauRecord,
    objectif_atteint: objectifAtteint,
  };
  const { data, error } = await supabase.from('contributions').insert(payload).select().single();
  if (error) throw error;
  const contribution = mapContribution(data);
  state.data.contributions = [...state.data.contributions, contribution];
  notify();
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

export async function addEvenementPlanning({ date, titre, lieu, description }) {
  const id = generateId('evt');
  const payload = { id, date, titre, lieu: lieu || '', description: description || '' };
  const { data, error } = await supabase.from('planning').insert(payload).select().single();
  if (error) throw error;
  const evenement = mapEvenement(data);
  state.data.planning = [...state.data.planning, evenement];
  notify();
  return evenement;
}

export async function deleteEvenementPlanning(id) {
  const { error } = await supabase.from('planning').delete().eq('id', id);
  if (error) throw error;
  state.data.planning = state.data.planning.filter((e) => e.id !== id);
  notify();
}

// Admin ----------------------------------------------------------------------

export function adminMotDePasseDefini() {
  return Boolean(state.data.admin.motDePasse);
}

export async function definirMotDePasseAdmin(motDePasse) {
  const { error } = await supabase.from('admin').upsert({ id: 1, mot_de_passe: motDePasse });
  if (error) throw error;
  state.data.admin.motDePasse = motDePasse;
  notify();
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
