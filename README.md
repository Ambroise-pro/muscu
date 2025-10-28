Projet : Application de Gestion de Cycle de Musculation (Lycée)

Version 2.0 - Focus Local (Élève Uniquement)

1. Objectif Principal

Créer une application web simple et accessible (mobile-first) pour permettre aux élèves de lycée de créer, gérer et suivre leur propre cycle de musculation. L'application fonctionne de manière autonome (hors-ligne) et sauvegarde toutes les données (programmes, performances) dans le cache du navigateur (localStorage).

2. Public Cible

Élèves de Lycée : Utilisateur unique. A besoin d'un outil simple pour définir son programme, guider ses séances, et enregistrer ses performances pour voir sa progression.

3. Fonctionnalités Clés

L'application n'a plus qu'un seul "profil" utilisateur.

[ ] Gestion de Profil : Saisie simple du nom de l'utilisateur pour personnaliser l'accueil.

[ ] Bibliothèque d'Exercices :

[ ] Consulter une bibliothèque d'exercices pré-remplie (avec description, muscles ciblés).

[ ] Possibilité d'ajouter/modifier/supprimer ses propres exercices.

[ ] Création de Programme (Cycle) :

[ ] Créer un ou plusieurs programmes (ex: "Cycle Force", "Cycle Hypertrophie").

[ ] Pour chaque programme, créer plusieurs séances (ex: "Séance 1 - Pectoraux/Triceps").

[ ] Ajouter des exercices de la bibliothèque à chaque séance (définir séries, répétitions, temps de repos).

[ ] Mode "Séance" :

[ ] Lancer une séance de son programme.

[ ] Affichage clair de l'exercice en cours, de l'objectif (séries/reps) et du temps de repos.

[ ] Saisie simple des performances (charge, répétitions) pour chaque série effectuée.

[ ] Historique et Progression :

[ ] Consulter l'historique de toutes les séances réalisées.

[ ] Calcul automatique du 1RM (One Rep Max) estimé pour les exercices pertinents après la saisie d'une performance (selon la formule de Brzycki : Poids / (1.0278 - (0.0278 * Répétitions))).

[ ] Visualiser la progression sur un exercice spécifique (graphique d'évolution de la charge, des répétitions, ou du 1RM estimé).

[ ] Gestion des Données (Local Storage) :

[ ] Sauvegarde automatique de toutes les données dans le navigateur.

[ ] (Optionnel) Fonction pour exporter les données (ex: en fichier JSON) pour sauvegarde.

[ ] (Optionnel) Fonction pour importer un fichier de données (pour restaurer ou transférer).

4. Structure des Données (Stockage Local)

Les données seront stockées dans localStorage sous une clé principale (ex: appMuscuData). Voici une proposition de structure pour l'objet JSON :

{
  "profil": {
    "nom": "Jean Élève"
  },
  "exercices": [
    { "id": "uuid-1", "nom": "Développé Couché", "muscle_cible": "Pectoraux" },
    { "id": "uuid-2", "nom": "Squat", "muscle_cible": "Jambes" }
    // ... plus d'exercices (pré-remplis ou ajoutés par l'élève)
  ],
  "programmes": [
    {
      "id": "prog-1",
      "nom": "Mon Cycle Force (3 jours)",
      "seances": [
        {
          "id": "seance-1",
          "nom": "Haut du Corps A",
          "exercices": [
            { "exercice_id": "uuid-1", "objectif": "3 séries de 5 reps", "repos_sec": 120 },
            { "exercice_id": "uuid-...", "objectif": "3 séries de 8-10 reps", "repos_sec": 90 }
          ]
        },
        { "id": "seance-2", "nom": "Bas du Corps" /* ... */ }
      ]
    }
  ],
  "historique": [
    {
      "id": "log-1",
      "date": "2025-10-25T10:30:00Z",
      "seance_nom": "Haut du Corps A",
      "performances": [
        {
          "exercice_id": "uuid-1",
          "exercice_nom": "Développé Couché",
          "series": [
            { "serie": 1, "poids": 60, "reps": 5, "e1rm": 67.5 }, // e1rm = 1RM Estimé
            { "serie": 2, "poids": 60, "reps": 5, "e1rm": 67.5 },
            { "serie": 3, "poids": 60, "reps": 4, "e1rm": 65.5 }
          ],
          "meilleur_e1rm_seance": 67.5
        }
        // ... performances des autres exercices
      ]
    }
  ]
}


5. Prochaines Étapes

Valider cette nouvelle structure simplifiée.

Choisir les technologies (Simple HTML/CSS/JS, ou un framework léger comme Vue.js ou Svelte, ou React/Angular si besoin).

Maquetter les écrans principaux (Accueil, Gestion de programme, Lancement de séance, Historique).

Commencer le développement du prototype.

---

## Analyse du cahier des charges

- **Public cible** : un élève unique. L'application doit donc fonctionner hors-ligne avec une expérience ultra-simple et aucune notion de compte.
- **Bloc fonctionnels principaux** :
  1. Gestion d'un profil minimaliste (nom affiché dans l'interface).
  2. Bibliothèque d'exercices (pré-remplie + personnalisable).
  3. Construction de programmes composés de séances contenant des exercices et leurs objectifs.
  4. Mode "Séance" pour saisir rapidement les performances et calculer automatiquement l'e1RM.
  5. Historique local des séances pour visualiser sa progression.
- **Contraintes techniques** : stockage exclusivement dans `localStorage`, fonctionnement mobile-first et option d'import/export ultérieure.

## Prototype initial (Version 0.1)

Une première version statique en HTML/CSS/JS pur est incluse dans ce dépôt (`index.html`, `styles.css`, `app.js`). Elle met en place :

- Le squelette d'interface mobile-first avec sections dédiées au profil, à la bibliothèque d'exercices, aux programmes, au mode séance et à l'historique.
- Un gestionnaire de données localStorage respectant la structure décrite ci-dessus (profil, exercices, programmes, historique).
- Une bibliothèque d'exercices de base modifiable (ajout/suppression).
- La création de programmes et de séances, avec ajout d'exercices issus de la bibliothèque et définition des objectifs/repos.
- Un mode séance permettant de sélectionner une séance, de renseigner jusqu'à trois séries par exercice et de calculer automatiquement le 1RM estimé via la formule de Brzycki.
- L'enregistrement de l'historique des séances et l'affichage du meilleur e1RM par exercice.

### Prochaines pistes

- Améliorer l'ergonomie du mode séance (ajout dynamique du nombre de séries, minuteur de repos, validation progressive).
- Ajouter des statistiques visuelles (graphique d'évolution du 1RM ou des charges).
- Proposer l'export/import des données au format JSON.
- Mettre en place des tests unitaires autour du stockage et des calculs (e1RM).
