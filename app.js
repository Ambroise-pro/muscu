const STORAGE_KEY = 'appMuscuData';
const DEFAULT_DATA = {
  profil: {
    nom: '',
  },
  exercices: [
    { id: 'base-1', nom: 'Développé couché', muscle_cible: 'Pectoraux / Triceps' },
    { id: 'base-2', nom: 'Squat', muscle_cible: 'Jambes' },
    { id: 'base-3', nom: 'Soulevé de terre', muscle_cible: 'Dos / Jambes' },
    { id: 'base-4', nom: 'Tractions', muscle_cible: 'Dos / Biceps' },
    { id: 'base-5', nom: 'Développé militaire', muscle_cible: 'Épaules / Triceps' },
  ],
  programmes: [],
  historique: [],
};

const state = {
  data: loadData(),
  seanceActive: null,
  flash: {
    profil: '',
    seance: '',
  },
};

function deepClone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return deepClone(DEFAULT_DATA);
    }
    const parsed = JSON.parse(raw);
    return {
      profil: { ...DEFAULT_DATA.profil, ...parsed.profil },
      exercices: Array.isArray(parsed.exercices) && parsed.exercices.length
        ? parsed.exercices
        : deepClone(DEFAULT_DATA.exercices),
      programmes: Array.isArray(parsed.programmes)
        ? parsed.programmes.map((programme) => ({
            ...programme,
            seances: Array.isArray(programme.seances)
              ? programme.seances.map((seance) => ({
                  ...seance,
                  exercices: Array.isArray(seance.exercices) ? seance.exercices : [],
                }))
              : [],
          }))
        : [],
      historique: Array.isArray(parsed.historique) ? parsed.historique : [],
    };
  } catch (error) {
    console.error('Impossible de charger les données depuis le stockage local', error);
    return deepClone(DEFAULT_DATA);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  renderAll();
}

function renderAll() {
  renderProfil();
  renderExercices();
  renderProgrammes();
  renderSeanceSelecteur();
  renderSeanceActive();
  renderHistorique();
}

// Profil --------------------------------------------------------------------

function renderProfil() {
  const nomInput = document.querySelector('#profil-nom');
  const message = document.querySelector('#profil-message');

  if (nomInput) {
    nomInput.value = state.data.profil.nom ?? '';
  }

  if (message) {
    message.textContent = state.flash.profil ||
      (state.data.profil.nom
        ? `Bienvenue ${state.data.profil.nom} !`
        : "Ajoute ton prénom pour personnaliser l'application.");
  }
}

function handleProfilSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const nom = (formData.get('profil-nom') || '').toString().trim();
  state.data.profil.nom = nom;
  state.flash.profil = nom ? 'Profil mis à jour ✅' : 'Profil réinitialisé.';
  saveData();
  setTimeout(() => {
    state.flash.profil = '';
    renderProfil();
  }, 2500);
}

// Exercices -----------------------------------------------------------------

function renderExercices() {
  const list = document.querySelector('#exercice-liste');
  if (!list) return;

  list.innerHTML = '';
  if (!state.data.exercices.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Ajoute tes exercices pour commencer.';
    list.appendChild(empty);
    return;
  }

  state.data.exercices.forEach((exercice) => {
    const item = document.createElement('li');
    const meta = document.createElement('div');
    meta.className = 'item-meta';
    meta.innerHTML = `<strong>${exercice.nom}</strong><span>${exercice.muscle_cible}</span>`;

    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'secondary';
    removeBtn.textContent = 'Supprimer';
    removeBtn.addEventListener('click', () => {
      deleteExercice(exercice.id);
    });
    actions.appendChild(removeBtn);

    item.append(meta, actions);
    list.appendChild(item);
  });
}

function handleExerciceSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const nom = (formData.get('exercice-nom') || '').toString().trim();
  const muscle = (formData.get('exercice-muscle') || '').toString().trim();

  if (!nom || !muscle) return;

  state.data.exercices.push({
    id: generateId('ex'),
    nom,
    muscle_cible: muscle,
  });
  event.target.reset();
  toggleElementVisibility('#exercice-form', false);
  saveData();
}

function deleteExercice(exerciceId) {
  state.data.exercices = state.data.exercices.filter((ex) => ex.id !== exerciceId);
  // Retirer également l'exercice des séances
  state.data.programmes.forEach((programme) => {
    programme.seances.forEach((seance) => {
      seance.exercices = seance.exercices.filter((item) => item.exercice_id !== exerciceId);
    });
  });
  saveData();
}

// Programmes ----------------------------------------------------------------

function renderProgrammes() {
  const container = document.querySelector('#programme-liste');
  if (!container) return;
  container.innerHTML = '';

  if (!state.data.programmes.length) {
    const empty = document.createElement('p');
    empty.className = 'help-text';
    empty.textContent = 'Crée ton premier programme pour organiser tes séances.';
    container.appendChild(empty);
    return;
  }

  state.data.programmes.forEach((programme) => {
    const card = document.createElement('article');
    card.className = 'programme-card';

    const header = document.createElement('div');
    header.className = 'card-header';
    const title = document.createElement('h3');
    title.textContent = programme.nom;
    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const addSeanceBtn = document.createElement('button');
    addSeanceBtn.type = 'button';
    addSeanceBtn.textContent = 'Ajouter une séance';
    addSeanceBtn.addEventListener('click', () => {
      showSeanceForm(programme.id);
    });

    const deleteProgrammeBtn = document.createElement('button');
    deleteProgrammeBtn.type = 'button';
    deleteProgrammeBtn.className = 'secondary';
    deleteProgrammeBtn.textContent = 'Supprimer';
    deleteProgrammeBtn.addEventListener('click', () => {
      if (confirm(`Supprimer le programme « ${programme.nom} » ?`)) {
        deleteProgramme(programme.id);
      }
    });

    actions.append(addSeanceBtn, deleteProgrammeBtn);
    header.append(title, actions);

    const sessions = document.createElement('div');
    sessions.className = 'session-list';

    if (!programme.seances.length) {
      const empty = document.createElement('p');
      empty.className = 'help-text';
      empty.textContent = 'Aucune séance pour le moment.';
      sessions.appendChild(empty);
    } else {
      programme.seances.forEach((seance) => {
        sessions.appendChild(createSeanceBlock(programme, seance));
      });
    }

    card.append(header, sessions);
    container.appendChild(card);
  });
}

function showSeanceForm(programmeId) {
  const programme = state.data.programmes.find((p) => p.id === programmeId);
  if (!programme) return;

  const seanceNom = prompt('Nom de la séance (ex: Haut du corps A)');
  if (!seanceNom) return;

  programme.seances.push({
    id: generateId('seance'),
    nom: seanceNom.trim(),
    exercices: [],
  });
  saveData();
}

function createSeanceBlock(programme, seance) {
  const container = document.createElement('div');
  container.className = 'session-item';
  container.dataset.programmeId = programme.id;
  container.dataset.seanceId = seance.id;

  const meta = document.createElement('div');
  meta.className = 'item-meta';
  const badge = `<span class="badge">${seance.exercices.length} exercice(s)</span>`;
  meta.innerHTML = `<strong>${seance.nom}</strong>${badge}`;

  const controls = document.createElement('div');
  controls.className = 'session-controls';

  const toggleFormBtn = document.createElement('button');
  toggleFormBtn.type = 'button';
  toggleFormBtn.textContent = 'Ajouter exercice';
  toggleFormBtn.addEventListener('click', () => {
    const form = container.querySelector('.seance-add-form');
    if (form) {
      form.classList.toggle('hidden');
    }
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'secondary';
  deleteBtn.textContent = 'Supprimer';
  deleteBtn.addEventListener('click', () => {
    if (confirm(`Supprimer la séance « ${seance.nom} » ?`)) {
      deleteSeance(programme.id, seance.id);
    }
  });

  controls.append(toggleFormBtn, deleteBtn);

  const exercicesList = document.createElement('ul');
  exercicesList.className = 'item-list';

  if (!seance.exercices.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Ajoute un exercice depuis la bibliothèque.';
    exercicesList.appendChild(empty);
  } else {
    seance.exercices.forEach((item) => {
      exercicesList.appendChild(createSeanceExerciseItem(programme.id, seance.id, item));
    });
  }

  const form = document.createElement('form');
  form.className = 'form-grid seance-add-form hidden';

  const exerciceLabel = document.createElement('label');
  exerciceLabel.textContent = 'Choisir un exercice';
  const exerciceSelect = document.createElement('select');
  exerciceSelect.name = 'exercice-id';
  exerciceSelect.required = true;

  state.data.exercices.forEach((exercice) => {
    const option = document.createElement('option');
    option.value = exercice.id;
    option.textContent = `${exercice.nom} (${exercice.muscle_cible})`;
    exerciceSelect.appendChild(option);
  });

  const objectifLabel = document.createElement('label');
  objectifLabel.textContent = 'Objectif (séries x reps)';
  const objectifInput = document.createElement('input');
  objectifInput.type = 'text';
  objectifInput.name = 'objectif';
  objectifInput.placeholder = '3 séries de 8-10 reps';
  objectifInput.required = true;

  const reposLabel = document.createElement('label');
  reposLabel.textContent = 'Repos (secondes)';
  const reposInput = document.createElement('input');
  reposInput.type = 'number';
  reposInput.name = 'repos';
  reposInput.min = '0';
  reposInput.placeholder = '90';
  reposInput.required = true;

  const formActions = document.createElement('div');
  formActions.className = 'form-actions';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Ajouter à la séance';
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'secondary';
  cancelBtn.textContent = 'Annuler';
  cancelBtn.addEventListener('click', () => {
    form.reset();
    form.classList.add('hidden');
  });
  formActions.append(submitBtn, cancelBtn);

  form.append(
    exerciceLabel,
    exerciceSelect,
    objectifLabel,
    objectifInput,
    reposLabel,
    reposInput,
    formActions,
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const exerciceId = data.get('exercice-id');
    const objectif = (data.get('objectif') || '').toString().trim();
    const repos = Number(data.get('repos'));

    if (!exerciceId || !objectif || Number.isNaN(repos)) return;
    addExerciseToSeance(programme.id, seance.id, {
      exercice_id: exerciceId,
      objectif,
      repos_sec: repos,
    });
    form.reset();
    form.classList.add('hidden');
  });

  container.append(meta, controls);
  const body = document.createElement('div');
  body.append(exercicesList, form);
  container.appendChild(body);
  return container;
}

function createSeanceExerciseItem(programmeId, seanceId, item) {
  const li = document.createElement('li');
  const exercice = state.data.exercices.find((ex) => ex.id === item.exercice_id);
  const nom = exercice ? exercice.nom : 'Exercice supprimé';

  const meta = document.createElement('div');
  meta.className = 'item-meta';
  meta.innerHTML = `<strong>${nom}</strong><span>${item.objectif}</span><span>Repos : ${item.repos_sec} sec</span>`;

  const actions = document.createElement('div');
  actions.className = 'item-actions';
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'secondary';
  removeBtn.textContent = 'Retirer';
  removeBtn.addEventListener('click', () => {
    removeExerciseFromSeance(programmeId, seanceId, item.exercice_id);
  });

  actions.appendChild(removeBtn);
  li.append(meta, actions);
  return li;
}

function addExerciseToSeance(programmeId, seanceId, payload) {
  const programme = state.data.programmes.find((p) => p.id === programmeId);
  if (!programme) return;
  const seance = programme.seances.find((s) => s.id === seanceId);
  if (!seance) return;
  const exists = seance.exercices.some((item) => item.exercice_id === payload.exercice_id);
  if (exists) {
    alert('Cet exercice est déjà présent dans la séance.');
    return;
  }
  seance.exercices.push({ ...payload });
  saveData();
}

function removeExerciseFromSeance(programmeId, seanceId, exerciceId) {
  const programme = state.data.programmes.find((p) => p.id === programmeId);
  if (!programme) return;
  const seance = programme.seances.find((s) => s.id === seanceId);
  if (!seance) return;
  seance.exercices = seance.exercices.filter((item) => item.exercice_id !== exerciceId);
  saveData();
}

function deleteProgramme(programmeId) {
  state.data.programmes = state.data.programmes.filter((programme) => programme.id !== programmeId);
  if (state.seanceActive && state.seanceActive.programmeId === programmeId) {
    state.seanceActive = null;
  }
  saveData();
}

function deleteSeance(programmeId, seanceId) {
  const programme = state.data.programmes.find((p) => p.id === programmeId);
  if (!programme) return;
  programme.seances = programme.seances.filter((seance) => seance.id !== seanceId);
  if (
    state.seanceActive &&
    state.seanceActive.programmeId === programmeId &&
    state.seanceActive.seanceId === seanceId
  ) {
    state.seanceActive = null;
  }
  saveData();
}

function handleProgrammeSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const nom = (formData.get('programme-nom') || '').toString().trim();
  if (!nom) return;
  state.data.programmes.push({
    id: generateId('prog'),
    nom,
    seances: [],
  });
  event.target.reset();
  toggleElementVisibility('#programme-form', false);
  saveData();
}

// Séances -------------------------------------------------------------------

function renderSeanceSelecteur() {
  const container = document.querySelector('#seance-selecteur');
  if (!container) return;
  container.innerHTML = '';

  const allSeances = [];
  state.data.programmes.forEach((programme) => {
    programme.seances.forEach((seance) => {
      allSeances.push({
        programmeId: programme.id,
        programmeNom: programme.nom,
        seanceId: seance.id,
        seanceNom: seance.nom,
      });
    });
  });

  if (!allSeances.length) {
    const message = document.createElement('p');
    message.className = 'help-text';
    message.textContent = 'Ajoute d\'abord un programme et une séance pour commencer.';
    container.appendChild(message);
    return;
  }

  const form = document.createElement('form');
  form.className = 'form-grid';

  const selectLabel = document.createElement('label');
  selectLabel.textContent = 'Choisis une séance';
  const select = document.createElement('select');
  select.name = 'seance-courante';

  allSeances.forEach((item) => {
    const option = document.createElement('option');
    option.value = `${item.programmeId}:${item.seanceId}`;
    option.textContent = `${item.programmeNom} · ${item.seanceNom}`;
    select.appendChild(option);
  });

  if (state.seanceActive) {
    select.value = `${state.seanceActive.programmeId}:${state.seanceActive.seanceId}`;
  }

  const startBtn = document.createElement('button');
  startBtn.type = 'submit';
  startBtn.textContent = 'Lancer la séance';

  form.append(selectLabel, select, startBtn);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = select.value;
    if (!value) return;
    const [programmeId, seanceId] = value.split(':');
    state.seanceActive = { programmeId, seanceId };
    state.flash.seance = '';
    renderSeanceActive();
  });

  container.appendChild(form);
}

function renderSeanceActive() {
  const container = document.querySelector('#seance-en-cours');
  if (!container) return;

  if (!state.seanceActive) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  const programme = state.data.programmes.find((p) => p.id === state.seanceActive.programmeId);
  const seance = programme?.seances.find((s) => s.id === state.seanceActive.seanceId);

  if (!programme || !seance) {
    container.classList.add('hidden');
    container.innerHTML = '';
    state.seanceActive = null;
    return;
  }

  container.classList.remove('hidden');
  container.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = `${programme.nom} · ${seance.nom}`;
  container.appendChild(title);

  if (!seance.exercices.length) {
    const message = document.createElement('p');
    message.className = 'help-text';
    message.textContent = 'Ajoute des exercices à cette séance pour enregistrer ta performance.';
    container.appendChild(message);
    return;
  }

  const form = document.createElement('form');
  form.className = 'performance-form';

  seance.exercices.forEach((item) => {
    form.appendChild(createPerformanceBlock(item));
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Enregistrer la séance';
  form.appendChild(submit);

  const feedback = document.createElement('p');
  feedback.className = 'help-text';
  feedback.textContent = state.flash.seance || '';
  form.appendChild(feedback);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = collectPerformance(seance);
    if (!result.performances.length) {
      state.flash.seance = 'Ajoute au moins une série pour enregistrer la séance.';
      renderSeanceActive();
      return;
    }
    state.data.historique.unshift({
      id: generateId('log'),
      date: new Date().toISOString(),
      programme_nom: programme.nom,
      seance_nom: seance.nom,
      performances: result.performances,
    });
    state.flash.seance = 'Séance enregistrée ✅';
    saveData();
    renderSeanceActive();
    setTimeout(() => {
      state.flash.seance = '';
      renderSeanceActive();
    }, 2500);
  });

  container.appendChild(form);
}

function createPerformanceBlock(item) {
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'exercise-performance';

  const exercice = state.data.exercices.find((ex) => ex.id === item.exercice_id);
  const nom = exercice ? exercice.nom : 'Exercice supprimé';
  const legend = document.createElement('legend');
  legend.textContent = nom;
  wrapper.appendChild(legend);

  const objectif = document.createElement('p');
  objectif.className = 'help-text';
  objectif.textContent = `${item.objectif} · Repos ${item.repos_sec} sec`;
  wrapper.appendChild(objectif);

  const seriesGrid = document.createElement('div');
  seriesGrid.className = 'series-grid';
  for (let i = 0; i < 3; i += 1) {
    const serieIndex = i + 1;
    const poidsInput = document.createElement('input');
    poidsInput.type = 'number';
    poidsInput.name = `${item.exercice_id}-poids-${serieIndex}`;
    poidsInput.placeholder = `Série ${serieIndex} · Poids (kg)`;
    poidsInput.min = '0';
    poidsInput.step = '0.5';

    const repsInput = document.createElement('input');
    repsInput.type = 'number';
    repsInput.name = `${item.exercice_id}-reps-${serieIndex}`;
    repsInput.placeholder = `Série ${serieIndex} · Répétitions`;
    repsInput.min = '1';

    seriesGrid.append(poidsInput, repsInput);
  }
  wrapper.appendChild(seriesGrid);

  return wrapper;
}

function collectPerformance(seance) {
  const performances = [];
  seance.exercices.forEach((item) => {
    const exercice = state.data.exercices.find((ex) => ex.id === item.exercice_id);
    const series = [];
    for (let i = 1; i <= 3; i += 1) {
      const poidsInput = document.querySelector(`[name="${item.exercice_id}-poids-${i}"]`);
      const repsInput = document.querySelector(`[name="${item.exercice_id}-reps-${i}"]`);
      const poids = Number(poidsInput?.value ?? 0);
      const reps = Number(repsInput?.value ?? 0);
      if (!poids || !reps) continue;
      const e1rm = calculateE1RM(poids, reps);
      series.push({
        serie: i,
        poids,
        reps,
        e1rm,
      });
    }
    if (series.length) {
      performances.push({
        exercice_id: item.exercice_id,
        exercice_nom: exercice ? exercice.nom : 'Exercice',
        series,
        meilleur_e1rm_seance: Math.max(...series.map((serie) => serie.e1rm)),
      });
    }
  });
  return { performances };
}

// Historique ----------------------------------------------------------------

function renderHistorique() {
  const list = document.querySelector('#historique-liste');
  if (!list) return;
  list.innerHTML = '';

  if (!state.data.historique.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Aucune séance enregistrée pour le moment.';
    list.appendChild(empty);
    return;
  }

  state.data.historique.forEach((log) => {
    const item = document.createElement('li');
    const meta = document.createElement('div');
    meta.className = 'item-meta';
    const date = new Date(log.date);
    const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    meta.innerHTML = `<strong>${log.seance_nom}</strong><span>${log.programme_nom} · ${dateFormatter.format(date)}</span>`;

    const performances = document.createElement('ul');
    performances.className = 'item-list';
    log.performances.forEach((perf) => {
      const perfItem = document.createElement('li');
      const meilleur = perf.meilleur_e1rm_seance.toFixed(1);
      perfItem.innerHTML = `<div class="item-meta"><strong>${perf.exercice_nom}</strong><span>Meilleur e1RM : ${meilleur} kg</span></div>`;
      performances.appendChild(perfItem);
    });

    item.append(meta, performances);
    list.appendChild(item);
  });
}

// Utilitaires ----------------------------------------------------------------

function calculateE1RM(poids, reps) {
  const safeReps = Math.max(1, Math.min(reps, 12));
  const estimation = poids / (1.0278 - 0.0278 * safeReps);
  return Math.round(estimation * 10) / 10;
}

function generateId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const random = Math.random().toString(16).slice(2, 10);
  return `${prefix}-${Date.now()}-${random}`;
}

function toggleElementVisibility(selector, show) {
  const element = document.querySelector(selector);
  if (!element) return;
  if (typeof show === 'boolean') {
    element.classList.toggle('hidden', !show);
  } else {
    element.classList.toggle('hidden');
  }
}

function setupInteractions() {
  document.querySelector('#profil-form')?.addEventListener('submit', handleProfilSubmit);
  document.querySelector('#exercice-form')?.addEventListener('submit', handleExerciceSubmit);
  document.querySelector('#programme-form')?.addEventListener('submit', handleProgrammeSubmit);

  document.querySelector('#toggle-exercice-form')?.addEventListener('click', () => {
    toggleElementVisibility('#exercice-form');
  });
  document.querySelector('#cancel-exercice')?.addEventListener('click', () => {
    const form = document.querySelector('#exercice-form');
    form?.reset();
    toggleElementVisibility('#exercice-form', false);
  });

  document.querySelector('#toggle-programme-form')?.addEventListener('click', () => {
    toggleElementVisibility('#programme-form');
  });
  document.querySelector('#cancel-programme')?.addEventListener('click', () => {
    const form = document.querySelector('#programme-form');
    form?.reset();
    toggleElementVisibility('#programme-form', false);
  });
}

// Initialisation -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  setupInteractions();
  renderAll();
});

