# Nuit du Sport

Application web pour organiser une **Nuit du Sport** au sein de l'association sportive du lycée : suivi des records battus en direct pendant la soirée, et planning des activités de l'année.

## Fonctionnalités

- **Accueil** : tableau des records actuels par activité + flux chronologique de toutes les contributions de la soirée (avec mise en avant des nouveaux records).
- **Contribuer** : n'importe qui (élève, parent) peut ajouter son résultat sur une activité / un type de record, sans indiquer son nom.
- **Planning** : liste des activités de l'association sportive prévues sur l'année (lecture publique).
- **Admin** (protégé par mot de passe) : création/suppression des activités et de leurs types de record, et gestion du planning. Deux modes de record :
  - **Record** : la meilleure valeur saisie gagne (le plus haut ou le plus bas gagne, au choix).
  - **Cumul** : les contributions s'additionnent vers un objectif collectif sur la soirée (avec barre de progression).
  - Un multiplicateur permet de convertir l'unité saisie en unité affichée (ex : 1 voie = 10 m, 1 tour = distance définie en admin).

### Activités préconfigurées

L'application est livrée avec 5 activités déjà créées (modifiables/supprimables depuis l'Admin) :

| Activité | Type de record | Mode |
|---|---|---|
| Escalade | Voies montées vers le Mont Blanc (1 voie = 10 m, objectif 4810 m) | Cumul |
| Sports de raquette | Matchs joués (objectif 127, comme à Roland Garros) | Cumul |
| Laser Run | Temps de course sans interruption | Record |
| Laser Run | Distance parcourue (1 tour = 400 m par défaut, à ajuster en Admin) | Record |
| Danse | Temps dansé sans interruption | Record |
| Golf | Balles frappées | Record |

Le nombre de matchs à Roland Garros et la distance par tour du Laser Run sont des valeurs par défaut éditables dans l'Admin si tu veux les ajuster.

## Mot de passe administrateur

Aucun mot de passe n'est codé en dur : la première personne qui ouvre l'onglet **Admin** et saisit un mot de passe le définit pour tout le monde (il est stocké dans la base partagée). Il est ensuite demandé à chaque nouvelle session sur chaque appareil. Il peut être changé depuis l'espace admin une fois connecté.

## Base de données partagée (Supabase)

Les données (activités, types de record, contributions, planning, mot de passe admin) sont stockées dans un projet **Supabase** (Postgres) partagé entre tous les appareils, avec **mise à jour en temps réel** : quand quelqu'un ajoute une contribution, tous les écrans connectés (accueil, écran de projection, téléphones des élèves) se mettent à jour automatiquement sans recharger la page.

### Mise en place

1. Crée un projet sur [supabase.com](https://supabase.com) (gratuit).
2. Ouvre **SQL Editor** dans le dashboard du projet, colle le contenu de [`supabase/schema.sql`](supabase/schema.sql) et exécute-le. Cela crée les tables, active la lecture/écriture publique (RLS) et le temps réel, et insère les 5 activités préconfigurées.
3. Récupère l'**URL du projet** et la **clé publique (anon/publishable)** dans Project Settings > API, et renseigne-les en haut de [`js/store.js`](js/store.js) (`SUPABASE_URL` et `SUPABASE_ANON_KEY`).

### ⚠️ Limitation de sécurité à connaître

Pour rester simple (pas d'authentification Supabase), la base autorise la lecture **et l'écriture** publiques sur toutes les tables : la protection de l'espace Admin par mot de passe est gérée uniquement côté application (interface), pas au niveau de la base. Une personne qui connaît l'URL et la clé Supabase pourrait théoriquement écrire directement dans la base en contournant l'interface. C'est acceptable pour un événement ponctuel entre élèves/parents de confiance, mais à durcir (Supabase Auth + RLS par rôle) si l'app devait être réutilisée dans un contexte plus exposé.

## Déploiement sur Vercel

Le site est 100% statique (HTML/CSS/JS sans build), donc le déploiement sur Vercel ne nécessite aucune configuration :

1. Importer ce dépôt GitHub dans Vercel (New Project > sélectionner le repo).
2. Laisser le framework preset sur "Other" et les commandes de build vides.
3. Déployer.

Chaque push sur la branche connectée à Vercel déclenche un nouveau déploiement automatique.

## Structure du projet

```
index.html         Structure des 4 onglets (Accueil, Contribuer, Planning, Admin)
styles.css         Styles de l'application
js/store.js        Couche de données (Supabase) + temps réel
js/app.js          Logique d'affichage et interactions
supabase/schema.sql  Schéma SQL à exécuter dans le projet Supabase
```
