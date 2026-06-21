# Nuit du Sport

Application web pour organiser une **Nuit du Sport** au sein de l'association sportive du lycée : suivi des records battus en direct pendant la soirée, et planning des activités de l'année.

## Fonctionnalités

- **Accueil** : tableau des records actuels par activité + flux chronologique de toutes les contributions de la soirée (avec mise en avant des nouveaux records).
- **Contribuer** : n'importe qui (élève, parent) peut ajouter son résultat sur une activité / un type de record, sans indiquer son nom.
- **Planning** : liste des activités de l'association sportive prévues sur l'année (lecture publique).
- **Admin** (protégé par mot de passe) : création/suppression des activités, des types de record associés (unité, sens du record : le plus haut ou le plus bas gagne), et gestion du planning.

## Mot de passe administrateur

Aucun mot de passe n'est codé en dur : la première personne qui ouvre l'onglet **Admin** et saisit un mot de passe le définit pour cet appareil. Il est ensuite demandé à chaque nouvelle session. Il peut être changé depuis l'espace admin une fois connecté.

## ⚠️ Stockage des données (limitation actuelle)

Pour cette première version, **toutes les données sont stockées dans le `localStorage` du navigateur**, comme demandé pour aller vite. Cela signifie :

- les données ne sont **pas partagées entre appareils** : si chaque élève utilise son propre téléphone, ses contributions ne seront visibles que sur son téléphone, pas sur celui des autres ni sur l'écran d'accueil affiché à la soirée ;
- pour que tout le monde voie les mêmes records en direct le soir de l'événement, il faut utiliser **un seul appareil partagé** (tablette/PC à l'entrée, ou téléphone unique relié à un vidéoprojecteur) sur lequel toutes les contributions sont saisies ;
- une base de données partagée (ex. Postgres) sera ajoutée dans une prochaine itération pour permettre à chacun de contribuer depuis son propre appareil avec mise à jour en temps réel pour tout le monde.

## Déploiement sur Vercel

Le site est 100% statique (HTML/CSS/JS sans build), donc le déploiement sur Vercel ne nécessite aucune configuration :

1. Importer ce dépôt GitHub dans Vercel (New Project > sélectionner le repo).
2. Laisser le framework preset sur "Other" et les commandes de build vides.
3. Déployer.

Chaque push sur la branche connectée à Vercel déclenche un nouveau déploiement automatique.

## Structure du projet

```
index.html       Structure des 4 onglets (Accueil, Contribuer, Planning, Admin)
styles.css       Styles de l'application
js/store.js      Couche de données (localStorage)
js/app.js        Logique d'affichage et interactions
```
