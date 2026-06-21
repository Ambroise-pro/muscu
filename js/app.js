import * as store from './store.js';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
const dateSeuleFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

function renderAll() {
  renderAccueil();
  renderContributionForm();
  renderPlanning();
  renderAdmin();
}

// Navigation -----------------------------------------------------------------

function setupTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.tab-panel').forEach((panel) => {
        panel.classList.toggle('hidden', panel.id !== `tab-${btn.dataset.tab}`);
      });
    });
  });
}

// Accueil ---------------------------------------------------------------------

function renderAccueil() {
  const grid = document.querySelector('#records-grid');
  const flux = document.querySelector('#flux-liste');
  if (!grid || !flux) return;

  grid.innerHTML = '';
  const activites = store.getActivites();

  if (!activites.length) {
    grid.innerHTML = '<p class="help-text">Aucune activité créée pour le moment.</p>';
  }

  activites.forEach((activite) => {
    const types = store.getTypesRecord(activite.id);
    const card = document.createElement('article');
    card.className = 'record-card';

    const title = document.createElement('h3');
    title.textContent = activite.nom;
    card.appendChild(title);

    if (!types.length) {
      const empty = document.createElement('p');
      empty.className = 'help-text';
      empty.textContent = 'Aucun type de record défini.';
      card.appendChild(empty);
    } else {
      const visuel = createVisuelActivite(activite, types);
      if (visuel) {
        card.appendChild(visuel);
      } else {
        types.forEach((type) => {
          card.appendChild(createRecordRow(type));
        });
      }
    }

    grid.appendChild(card);
  });

  flux.innerHTML = '';
  const contributions = store.getFluxContributions();
  if (!contributions.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Aucune contribution pour le moment.';
    flux.appendChild(empty);
    return;
  }

  contributions.forEach((contribution) => {
    const type = store.getTypeRecord(contribution.typeRecordId);
    const activite = type ? store.getActivites().find((a) => a.id === type.activiteId) : null;
    const item = document.createElement('li');
    const meta = document.createElement('div');
    meta.className = 'item-meta';
    const titre = activite && type ? `${activite.nom} · ${type.nom}` : 'Activité supprimée';
    const valeurAffichee = type ? store.getValeurAffichee(contribution, type) : contribution.valeur;
    const detailSaisie = type && type.multiplicateur !== 1
      ? `${contribution.valeur} ${type.uniteSaisie} · `
      : '';
    let badge = '';
    if (contribution.nouveauRecord) {
      badge = '<span class="badge badge-record">🏆 Nouveau record !</span>';
    } else if (contribution.objectifAtteint) {
      badge = '<span class="badge badge-record">🎉 Objectif atteint !</span>';
    }
    meta.innerHTML = `<strong>${titre}</strong><span>${detailSaisie}${valeurAffichee} ${type ? type.unite : ''} · ${dateFormatter.format(new Date(contribution.date))}</span>${badge}`;
    item.appendChild(meta);
    flux.appendChild(item);
  });
}

function createRecordRow(type) {
  const row = document.createElement('div');
  row.className = 'record-row';
  const label = document.createElement('span');
  label.className = 'record-label';
  label.textContent = type.nom;
  const value = document.createElement('span');
  value.className = 'record-value';

  if (type.mode === 'cumul') {
    const total = store.getTotalCumule(type.id);
    const objectif = type.objectif;
    value.textContent = objectif ? `${total} / ${objectif} ${type.unite}` : `${total} ${type.unite}`;
    row.append(label, value);

    if (objectif) {
      const progressWrap = document.createElement('div');
      progressWrap.className = 'progress-bar';
      const progressFill = document.createElement('div');
      progressFill.className = 'progress-fill';
      const pourcentage = Math.min(100, Math.round((total / objectif) * 100));
      progressFill.style.width = `${pourcentage}%`;
      progressWrap.appendChild(progressFill);
      const wrapper = document.createElement('div');
      wrapper.className = 'record-row-cumul';
      wrapper.append(row, progressWrap);
      return wrapper;
    }
    return row;
  }

  const record = store.getRecordActuel(type.id);
  value.textContent = record ? `${store.getValeurAffichee(record, type)} ${type.unite}` : 'Pas encore de résultat';
  row.append(label, value);
  return row;
}

// Visuels personnalisés par activité --------------------------------------------

function createVisuelActivite(activite, types) {
  switch (activite.visuel) {
    case 'mont-blanc':
      return createMontBlancCard(activite, types);
    case 'badminton':
      return createBadmintonCard(activite, types);
    case 'laser-run':
      return createLaserRunCard(activite, types);
    case 'disco':
      return createDiscoCard(activite, types);
    case 'golf':
      return createGolfCard(activite, types);
    default:
      return null;
  }
}

function createMontBlancCard(activite, types) {
  const type = types.find((t) => t.mode === 'cumul');
  if (!type) return null;
  const total = store.getTotalCumule(type.id);
  const objectif = type.objectif || 1;
  const pct = Math.min(100, Math.round((total / objectif) * 100));
  const fillHeight = (130 * pct) / 100;
  const fillY = 150 - fillHeight;
  const uid = activite.id;

  const wrap = document.createElement('div');
  wrap.className = 'visual-card visual-montblanc';
  wrap.innerHTML = `
    <svg viewBox="0 0 200 150" class="montblanc-svg" aria-hidden="true">
      <defs>
        <clipPath id="clip-${uid}">
          <path d="M0,150 L38,64 L60,92 L92,28 L118,84 L146,52 L200,150 Z" />
        </clipPath>
        <linearGradient id="grad-${uid}" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#0066ff" />
          <stop offset="100%" stop-color="#93c5fd" />
        </linearGradient>
      </defs>
      <path d="M0,150 L38,64 L60,92 L92,28 L118,84 L146,52 L200,150 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" />
      <g clip-path="url(#clip-${uid})">
        <rect x="0" y="${fillY}" width="200" height="${fillHeight}" fill="url(#grad-${uid})" class="montblanc-fill" />
      </g>
      <path d="M92,28 L100,40 L84,40 Z" fill="#fff" />
      <path d="M146,52 L154,62 L138,62 Z" fill="#fff" />
    </svg>
    <p class="visual-stats">🏔️ ${total} / ${objectif} m <span class="visual-pct">(${pct}%)</span></p>
  `;
  return wrap;
}

function createBadmintonCard(activite, types) {
  const type = types.find((t) => t.mode === 'cumul');
  if (!type) return null;
  const total = store.getTotalCumule(type.id);
  const objectif = type.objectif || 1;
  const pct = Math.min(100, Math.round((total / objectif) * 100));
  const fillHeight = (90 * pct) / 100;
  const fillY = 100 - fillHeight;
  const uid = activite.id;

  const wrap = document.createElement('div');
  wrap.className = 'visual-card visual-badminton';
  wrap.innerHTML = `
    <svg viewBox="0 0 200 110" class="badminton-svg" aria-hidden="true">
      <defs>
        <clipPath id="clip-${uid}"><rect x="10" y="10" width="180" height="90" /></clipPath>
      </defs>
      <rect x="10" y="10" width="180" height="90" fill="#15803d" stroke="#fff" stroke-width="2" />
      <line x1="100" y1="10" x2="100" y2="100" stroke="#fff" stroke-width="2" stroke-dasharray="4 3" />
      <line x1="100" y1="40" x2="100" y2="70" stroke="#1d1d1d" stroke-width="4" />
      <g clip-path="url(#clip-${uid})">
        <rect x="10" y="${fillY}" width="180" height="${fillHeight}" fill="rgba(255,255,255,0.35)" class="badminton-fill" />
      </g>
      <rect x="10" y="10" width="180" height="90" fill="none" stroke="#fff" stroke-width="2" />
    </svg>
    <p class="visual-stats">🏸 ${total} / ${objectif} matchs <span class="visual-pct">(${pct}%)</span></p>
  `;
  return wrap;
}

function createLaserRunCard(activite, types) {
  const recordTypes = types.filter((t) => t.mode === 'record');
  const tempsType = recordTypes.find((t) => t.unite === 'minutes');
  const distanceType = recordTypes.find((t) => t.unite !== 'minutes');
  if (!tempsType && !distanceType) return null;
  const uid = activite.id;
  const recordTemps = tempsType ? store.getRecordActuel(tempsType.id) : null;
  const recordDistance = distanceType ? store.getRecordActuel(distanceType.id) : null;
  const valeurTemps = recordTemps ? store.getValeurAffichee(recordTemps, tempsType) : null;
  const valeurDistance = recordDistance ? store.getValeurAffichee(recordDistance, distanceType) : null;

  const wrap = document.createElement('div');
  wrap.className = 'visual-card visual-laserrun';
  wrap.innerHTML = `
    <svg viewBox="0 0 200 140" class="laserrun-svg" aria-hidden="true">
      <path id="track-${uid}" d="M50,30 H150 A40,40 0 0 1 150,110 H50 A40,40 0 0 1 50,30 Z" fill="none" stroke="#94a3b8" stroke-width="14" stroke-linecap="round" />
      <circle r="7" fill="#0066ff">
        <animateMotion dur="3.5s" repeatCount="indefinite">
          <mpath href="#track-${uid}" />
        </animateMotion>
      </circle>
      <text font-size="16" text-anchor="middle">🏃<animateMotion dur="3.5s" repeatCount="indefinite"><mpath href="#track-${uid}" /></animateMotion></text>
      <circle cx="100" cy="70" r="38" fill="#1d1d1d" />
      <circle cx="100" cy="70" r="38" fill="none" stroke="#0066ff" stroke-width="2" class="chrono-ring" />
      <text x="100" y="68" text-anchor="middle" class="chrono-value">${valeurTemps ?? '–'}</text>
      <text x="100" y="84" text-anchor="middle" class="chrono-unit">min</text>
    </svg>
    <p class="visual-stats">📏 Distance record : ${valeurDistance ?? '–'} m</p>
  `;
  return wrap;
}

function createDiscoCard(activite, types) {
  const type = types.find((t) => t.mode === 'record');
  if (!type) return null;
  const record = store.getRecordActuel(type.id);
  const valeur = record ? store.getValeurAffichee(record, type) : null;

  const wrap = document.createElement('div');
  wrap.className = 'visual-card visual-disco';
  wrap.innerHTML = `
    <div class="disco-stage">
      <div class="disco-beam beam-1"></div>
      <div class="disco-beam beam-2"></div>
      <div class="disco-beam beam-3"></div>
      <div class="disco-ball"></div>
    </div>
    <p class="visual-stats">💃 ${valeur ?? '–'} min sans s'arrêter</p>
  `;
  return wrap;
}

function createGolfCard(activite, types) {
  const type = types.find((t) => t.mode === 'record');
  if (!type) return null;
  const record = store.getRecordActuel(type.id);
  const valeur = record ? store.getValeurAffichee(record, type) : null;
  const uid = activite.id;

  const wrap = document.createElement('div');
  wrap.className = 'visual-card visual-golf';
  wrap.innerHTML = `
    <svg viewBox="0 0 200 120" class="golf-svg" aria-hidden="true">
      <ellipse cx="100" cy="92" rx="92" ry="24" fill="#22c55e" />
      <path id="ballpath-${uid}" d="M28,98 Q100,55 158,86" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="3 4" opacity="0.6" />
      <circle cx="160" cy="86" r="3" fill="#14532d" />
      <line x1="160" y1="86" x2="160" y2="42" stroke="#78350f" stroke-width="2" />
      <path d="M160,42 L182,48 L160,54 Z" fill="#ef4444" />
      <circle r="4" fill="#fdfdfd" stroke="#1d1d1d" stroke-width="1">
        <animateMotion dur="2.8s" repeatCount="indefinite">
          <mpath href="#ballpath-${uid}" />
        </animateMotion>
      </circle>
    </svg>
    <p class="visual-stats">🏌️ ${valeur ?? '–'} balles frappées</p>
  `;
  return wrap;
}

// Contribuer -------------------------------------------------------------------

function renderContributionForm() {
  const activiteSelect = document.querySelector('#contribution-activite');
  const typeSelect = document.querySelector('#contribution-type');
  if (!activiteSelect || !typeSelect) return;

  const activites = store.getActivites();
  activiteSelect.innerHTML = '';

  if (!activites.length) {
    activiteSelect.innerHTML = '<option value="">Aucune activité disponible</option>';
    typeSelect.innerHTML = '';
    return;
  }

  activites.forEach((activite) => {
    const option = document.createElement('option');
    option.value = activite.id;
    option.textContent = activite.nom;
    activiteSelect.appendChild(option);
  });

  updateTypeOptions();
}

function updateTypeOptions() {
  const activiteSelect = document.querySelector('#contribution-activite');
  const typeSelect = document.querySelector('#contribution-type');
  if (!activiteSelect || !typeSelect) return;

  const types = store.getTypesRecord(activiteSelect.value);
  typeSelect.innerHTML = '';
  if (!types.length) {
    typeSelect.innerHTML = '<option value="">Aucun type de record</option>';
    updateContributionHint();
    return;
  }
  types.forEach((type) => {
    const option = document.createElement('option');
    option.value = type.id;
    option.textContent = type.nom;
    typeSelect.appendChild(option);
  });
  updateContributionHint();
}

function updateContributionHint() {
  const typeSelect = document.querySelector('#contribution-type');
  const hint = document.querySelector('#contribution-hint');
  const valeurLabel = document.querySelector('#contribution-valeur-label');
  if (!typeSelect || !hint || !valeurLabel) return;

  const type = store.getTypeRecord(typeSelect.value);
  if (!type) {
    hint.textContent = '';
    valeurLabel.textContent = 'Ton résultat';
    return;
  }

  valeurLabel.textContent = `Ton résultat (en ${type.uniteSaisie})`;
  hint.textContent = type.multiplicateur !== 1
    ? `1 ${type.uniteSaisie} = ${type.multiplicateur} ${type.unite}`
    : '';
}

async function handleContributionSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const typeRecordId = formData.get('type');
  const valeur = Number(formData.get('valeur'));
  const message = document.querySelector('#contribution-message');

  if (!typeRecordId || Number.isNaN(valeur)) {
    message.textContent = 'Choisis une activité, un type de record et un résultat valide.';
    return;
  }

  try {
    const contribution = await store.addContribution({ typeRecordId, valeur });
    if (contribution?.nouveauRecord) {
      message.textContent = '🏆 Bravo, nouveau record !';
    } else if (contribution?.objectifAtteint) {
      message.textContent = '🎉 Objectif atteint grâce à toi !';
    } else {
      message.textContent = 'Contribution enregistrée, merci !';
    }
    event.target.reset();
    renderAccueil();
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la contribution', error);
    message.textContent = 'Erreur réseau, ta contribution n\'a pas été enregistrée. Réessaie.';
  }
  setTimeout(() => {
    message.textContent = '';
  }, 3000);
}

// Planning ----------------------------------------------------------------------

function renderPlanning() {
  const liste = document.querySelector('#planning-liste');
  const toggleBtn = document.querySelector('#toggle-planning-form');
  if (!liste) return;

  toggleBtn?.classList.toggle('hidden', !store.adminEstDeverrouille());

  liste.innerHTML = '';
  const evenements = store.getPlanning();
  if (!evenements.length) {
    const empty = document.createElement('li');
    empty.textContent = "Aucun événement au planning pour l'instant.";
    liste.appendChild(empty);
    return;
  }

  evenements.forEach((evenement) => {
    const item = document.createElement('li');
    const meta = document.createElement('div');
    meta.className = 'item-meta';
    meta.innerHTML = `<strong>${evenement.titre}</strong><span>${dateSeuleFormatter.format(new Date(evenement.date))}${evenement.lieu ? ` · ${evenement.lieu}` : ''}</span>${evenement.description ? `<span>${evenement.description}</span>` : ''}`;
    item.appendChild(meta);

    if (store.adminEstDeverrouille()) {
      const actions = document.createElement('div');
      actions.className = 'item-actions';
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'secondary';
      deleteBtn.textContent = 'Supprimer';
      deleteBtn.addEventListener('click', async () => {
        await store.deleteEvenementPlanning(evenement.id);
        renderPlanning();
      });
      actions.appendChild(deleteBtn);
      item.appendChild(actions);
    }

    liste.appendChild(item);
  });
}

async function handlePlanningSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  await store.addEvenementPlanning({
    date: formData.get('date'),
    titre: (formData.get('titre') || '').toString().trim(),
    lieu: (formData.get('lieu') || '').toString().trim(),
    description: (formData.get('description') || '').toString().trim(),
  });
  event.target.reset();
  toggleVisibility('#planning-form', false);
  renderPlanning();
}

// Admin ---------------------------------------------------------------------

function renderAdmin() {
  const verrou = document.querySelector('#admin-verrou');
  const contenu = document.querySelector('#admin-contenu');
  const message = document.querySelector('#admin-verrou-message');
  if (!verrou || !contenu) return;

  const deverrouille = store.adminEstDeverrouille();
  verrou.classList.toggle('hidden', deverrouille);
  contenu.classList.toggle('hidden', !deverrouille);

  if (!deverrouille) {
    message.textContent = store.adminMotDePasseDefini()
      ? 'Saisis le mot de passe administrateur.'
      : "Aucun mot de passe défini : choisis-en un, il te sera demandé la prochaine fois.";
  }

  if (deverrouille) {
    renderActivites();
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const password = (formData.get('password') || '').toString();
  const message = document.querySelector('#admin-verrou-message');

  if (!store.adminMotDePasseDefini()) {
    await store.definirMotDePasseAdmin(password);
    store.deverrouillerAdmin();
    event.target.reset();
    renderAll();
    return;
  }

  if (store.verifierMotDePasseAdmin(password)) {
    store.deverrouillerAdmin();
    event.target.reset();
    renderAll();
  } else {
    message.textContent = 'Mot de passe incorrect.';
  }
}

function handleAdminLogout() {
  store.verrouillerAdmin();
  renderAll();
}

async function handleAdminPasswordUpdate(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const password = (formData.get('password') || '').toString();
  if (!password) return;
  await store.definirMotDePasseAdmin(password);
  event.target.reset();
}

function renderActivites() {
  const container = document.querySelector('#activite-liste');
  if (!container) return;
  container.innerHTML = '';

  const activites = store.getActivites();
  if (!activites.length) {
    container.innerHTML = '<p class="help-text">Crée ta première activité pour commencer.</p>';
    return;
  }

  activites.forEach((activite) => {
    container.appendChild(createActiviteBlock(activite));
  });
}

function createActiviteBlock(activite) {
  const card = document.createElement('article');
  card.className = 'programme-card';

  const header = document.createElement('div');
  header.className = 'card-header';
  const title = document.createElement('h3');
  title.textContent = activite.nom;
  const actions = document.createElement('div');
  actions.className = 'item-actions';

  const addTypeBtn = document.createElement('button');
  addTypeBtn.type = 'button';
  addTypeBtn.textContent = 'Ajouter un type de record';
  addTypeBtn.addEventListener('click', () => {
    const form = card.querySelector('.type-record-form');
    form?.classList.toggle('hidden');
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'secondary';
  deleteBtn.textContent = 'Supprimer';
  deleteBtn.addEventListener('click', async () => {
    if (confirm(`Supprimer l'activité « ${activite.nom} » et ses types de record ?`)) {
      await store.deleteActivite(activite.id);
      renderActivites();
      renderAll();
    }
  });

  actions.append(addTypeBtn, deleteBtn);
  header.append(title, actions);

  if (activite.description) {
    const desc = document.createElement('p');
    desc.className = 'help-text';
    desc.textContent = activite.description;
    header.appendChild(desc);
  }

  const typesList = document.createElement('ul');
  typesList.className = 'item-list';
  const types = store.getTypesRecord(activite.id);

  if (!types.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Aucun type de record pour cette activité.';
    typesList.appendChild(empty);
  } else {
    types.forEach((type) => {
      const li = document.createElement('li');
      const meta = document.createElement('div');
      meta.className = 'item-meta';
      const conversion = type.multiplicateur !== 1
        ? ` · 1 ${type.uniteSaisie} = ${type.multiplicateur} ${type.unite}`
        : '';
      const detail = type.mode === 'cumul'
        ? `Cumul · objectif : ${type.objectif ?? '—'} ${type.unite}${conversion}`
        : `Record · ${type.sens === 'plus_bas' ? 'le plus bas gagne' : 'le plus haut gagne'}${conversion}`;
      meta.innerHTML = `<strong>${type.nom}</strong><span>${detail}</span>`;

      const itemActions = document.createElement('div');
      itemActions.className = 'item-actions';
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'secondary';
      removeBtn.textContent = 'Supprimer';
      removeBtn.addEventListener('click', async () => {
        await store.deleteTypeRecord(type.id);
        renderActivites();
        renderAll();
      });
      itemActions.appendChild(removeBtn);

      li.append(meta, itemActions);
      typesList.appendChild(li);
    });
  }

  const form = document.createElement('form');
  form.className = 'form-grid type-record-form hidden';

  const nomLabel = document.createElement('label');
  nomLabel.textContent = 'Nom du type de record';
  const nomInput = document.createElement('input');
  nomInput.type = 'text';
  nomInput.placeholder = 'Nombre de répétitions';
  nomInput.required = true;

  const modeLabel = document.createElement('label');
  modeLabel.textContent = 'Mode';
  const modeSelect = document.createElement('select');
  const optRecord = document.createElement('option');
  optRecord.value = 'record';
  optRecord.textContent = 'Record (la meilleure valeur gagne)';
  const optCumul = document.createElement('option');
  optCumul.value = 'cumul';
  optCumul.textContent = 'Cumul (objectif collectif sur la soirée)';
  modeSelect.append(optRecord, optCumul);

  const uniteSaisieLabel = document.createElement('label');
  uniteSaisieLabel.textContent = 'Unité saisie par le contributeur';
  const uniteSaisieInput = document.createElement('input');
  uniteSaisieInput.type = 'text';
  uniteSaisieInput.placeholder = 'voies, tours, matchs, minutes...';
  uniteSaisieInput.required = true;

  const uniteLabel = document.createElement('label');
  uniteLabel.textContent = 'Unité affichée du résultat';
  const uniteInput = document.createElement('input');
  uniteInput.type = 'text';
  uniteInput.placeholder = 'répétitions, secondes, mètres...';
  uniteInput.required = true;

  const multiplicateurLabel = document.createElement('label');
  multiplicateurLabel.textContent = 'Valeur réelle par unité saisie (ex : 10 m par voie)';
  const multiplicateurInput = document.createElement('input');
  multiplicateurInput.type = 'number';
  multiplicateurInput.min = '0';
  multiplicateurInput.step = 'any';
  multiplicateurInput.value = '1';
  multiplicateurInput.required = true;

  const sensLabel = document.createElement('label');
  sensLabel.textContent = 'Qui gagne ?';
  const sensSelect = document.createElement('select');
  const optHaut = document.createElement('option');
  optHaut.value = 'plus_haut';
  optHaut.textContent = 'Le plus haut gagne';
  const optBas = document.createElement('option');
  optBas.value = 'plus_bas';
  optBas.textContent = 'Le plus bas gagne';
  sensSelect.append(optHaut, optBas);

  const objectifLabel = document.createElement('label');
  objectifLabel.textContent = 'Objectif collectif à atteindre';
  const objectifInput = document.createElement('input');
  objectifInput.type = 'number';
  objectifInput.min = '0';
  objectifInput.step = 'any';
  objectifInput.placeholder = '4810';

  const sensField = document.createElement('div');
  sensField.append(sensLabel, sensSelect);
  const objectifField = document.createElement('div');
  objectifField.append(objectifLabel, objectifInput);
  objectifField.classList.add('hidden');

  modeSelect.addEventListener('change', () => {
    const estCumul = modeSelect.value === 'cumul';
    objectifField.classList.toggle('hidden', !estCumul);
    sensField.classList.toggle('hidden', estCumul);
  });

  const formActions = document.createElement('div');
  formActions.className = 'form-actions';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Ajouter';
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'secondary';
  cancelBtn.textContent = 'Annuler';
  cancelBtn.addEventListener('click', () => {
    form.reset();
    objectifField.classList.add('hidden');
    sensField.classList.remove('hidden');
    form.classList.add('hidden');
  });
  formActions.append(submitBtn, cancelBtn);

  form.append(
    nomLabel,
    nomInput,
    modeLabel,
    modeSelect,
    uniteSaisieLabel,
    uniteSaisieInput,
    uniteLabel,
    uniteInput,
    multiplicateurLabel,
    multiplicateurInput,
    sensField,
    objectifField,
    formActions,
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!nomInput.value.trim() || !uniteSaisieInput.value.trim() || !uniteInput.value.trim()) return;
    await store.addTypeRecord({
      activiteId: activite.id,
      nom: nomInput.value.trim(),
      mode: modeSelect.value,
      uniteSaisie: uniteSaisieInput.value.trim(),
      unite: uniteInput.value.trim(),
      multiplicateur: multiplicateurInput.value,
      sens: sensSelect.value,
      objectif: objectifInput.value,
    });
    form.reset();
    objectifField.classList.add('hidden');
    sensField.classList.remove('hidden');
    form.classList.add('hidden');
    renderActivites();
    renderAll();
  });

  const body = document.createElement('div');
  body.append(typesList, form);

  card.append(header, body);
  return card;
}

async function handleActiviteSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const nom = (formData.get('nom') || '').toString().trim();
  const description = (formData.get('description') || '').toString().trim();
  if (!nom) return;
  await store.addActivite({ nom, description });
  event.target.reset();
  toggleVisibility('#activite-form', false);
  renderActivites();
  renderContributionForm();
  renderAccueil();
}

// Utilitaires -----------------------------------------------------------------

function toggleVisibility(selector, show) {
  const element = document.querySelector(selector);
  if (!element) return;
  if (typeof show === 'boolean') {
    element.classList.toggle('hidden', !show);
  } else {
    element.classList.toggle('hidden');
  }
}

function setupInteractions() {
  setupTabs();

  document.querySelector('#contribution-activite')?.addEventListener('change', updateTypeOptions);
  document.querySelector('#contribution-type')?.addEventListener('change', updateContributionHint);
  document.querySelector('#contribution-form')?.addEventListener('submit', handleContributionSubmit);

  document.querySelector('#toggle-planning-form')?.addEventListener('click', () => toggleVisibility('#planning-form'));
  document.querySelector('#cancel-planning')?.addEventListener('click', () => toggleVisibility('#planning-form', false));
  document.querySelector('#planning-form')?.addEventListener('submit', handlePlanningSubmit);

  document.querySelector('#admin-login-form')?.addEventListener('submit', handleAdminLogin);
  document.querySelector('#admin-logout')?.addEventListener('click', handleAdminLogout);
  document.querySelector('#admin-password-form')?.addEventListener('submit', handleAdminPasswordUpdate);

  document.querySelector('#toggle-activite-form')?.addEventListener('click', () => toggleVisibility('#activite-form'));
  document.querySelector('#cancel-activite')?.addEventListener('click', () => toggleVisibility('#activite-form', false));
  document.querySelector('#activite-form')?.addEventListener('submit', handleActiviteSubmit);
}

document.addEventListener('DOMContentLoaded', async () => {
  setupInteractions();
  store.onChange(renderAll);

  const grid = document.querySelector('#records-grid');
  if (grid) grid.innerHTML = '<p class="help-text">Chargement des données…</p>';

  try {
    await store.initStore();
    renderAll();
  } catch (error) {
    console.error('Impossible de se connecter à la base de données', error);
    if (grid) {
      grid.innerHTML = '<p class="help-text">Impossible de charger les données. Vérifie ta connexion.</p>';
    }
  }
});
