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
      types.forEach((type) => {
        const record = store.getRecordActuel(type.id);
        const row = document.createElement('div');
        row.className = 'record-row';
        const label = document.createElement('span');
        label.className = 'record-label';
        label.textContent = type.nom;
        const value = document.createElement('span');
        value.className = 'record-value';
        value.textContent = record ? `${record.valeur} ${type.unite}` : 'Pas encore de résultat';
        row.append(label, value);
        card.appendChild(row);
      });
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
    const badge = contribution.nouveauRecord ? '<span class="badge badge-record">🏆 Nouveau record !</span>' : '';
    meta.innerHTML = `<strong>${titre}</strong><span>${contribution.valeur} ${type ? type.unite : ''} · ${dateFormatter.format(new Date(contribution.date))}</span>${badge}`;
    item.appendChild(meta);
    flux.appendChild(item);
  });
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
    return;
  }
  types.forEach((type) => {
    const option = document.createElement('option');
    option.value = type.id;
    option.textContent = `${type.nom} (${type.unite})`;
    typeSelect.appendChild(option);
  });
}

function handleContributionSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const typeRecordId = formData.get('type');
  const valeur = Number(formData.get('valeur'));
  const message = document.querySelector('#contribution-message');

  if (!typeRecordId || Number.isNaN(valeur)) {
    message.textContent = 'Choisis une activité, un type de record et un résultat valide.';
    return;
  }

  const contribution = store.addContribution({ typeRecordId, valeur });
  message.textContent = contribution?.nouveauRecord
    ? '🏆 Bravo, nouveau record !'
    : 'Contribution enregistrée, merci !';
  event.target.reset();
  renderAccueil();
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
      deleteBtn.addEventListener('click', () => {
        store.deleteEvenementPlanning(evenement.id);
        renderPlanning();
      });
      actions.appendChild(deleteBtn);
      item.appendChild(actions);
    }

    liste.appendChild(item);
  });
}

function handlePlanningSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  store.addEvenementPlanning({
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

function handleAdminLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const password = (formData.get('password') || '').toString();
  const message = document.querySelector('#admin-verrou-message');

  if (!store.adminMotDePasseDefini()) {
    store.definirMotDePasseAdmin(password);
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

function handleAdminPasswordUpdate(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const password = (formData.get('password') || '').toString();
  if (!password) return;
  store.definirMotDePasseAdmin(password);
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
  deleteBtn.addEventListener('click', () => {
    if (confirm(`Supprimer l'activité « ${activite.nom} » et ses types de record ?`)) {
      store.deleteActivite(activite.id);
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
      const sensLabel = type.sens === 'plus_bas' ? 'le plus bas gagne' : 'le plus haut gagne';
      meta.innerHTML = `<strong>${type.nom}</strong><span>Unité : ${type.unite} · ${sensLabel}</span>`;

      const itemActions = document.createElement('div');
      itemActions.className = 'item-actions';
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'secondary';
      removeBtn.textContent = 'Supprimer';
      removeBtn.addEventListener('click', () => {
        store.deleteTypeRecord(type.id);
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

  const uniteLabel = document.createElement('label');
  uniteLabel.textContent = 'Unité';
  const uniteInput = document.createElement('input');
  uniteInput.type = 'text';
  uniteInput.placeholder = 'répétitions, secondes, mètres...';
  uniteInput.required = true;

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
    form.classList.add('hidden');
  });
  formActions.append(submitBtn, cancelBtn);

  form.append(nomLabel, nomInput, uniteLabel, uniteInput, sensLabel, sensSelect, formActions);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!nomInput.value.trim() || !uniteInput.value.trim()) return;
    store.addTypeRecord({
      activiteId: activite.id,
      nom: nomInput.value.trim(),
      unite: uniteInput.value.trim(),
      sens: sensSelect.value,
    });
    form.reset();
    form.classList.add('hidden');
    renderActivites();
    renderAll();
  });

  const body = document.createElement('div');
  body.append(typesList, form);

  card.append(header, body);
  return card;
}

function handleActiviteSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const nom = (formData.get('nom') || '').toString().trim();
  const description = (formData.get('description') || '').toString().trim();
  if (!nom) return;
  store.addActivite({ nom, description });
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

document.addEventListener('DOMContentLoaded', () => {
  setupInteractions();
  renderAll();
});
