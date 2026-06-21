-- Nuit du Sport — schéma Supabase
-- À exécuter une seule fois dans le SQL Editor de ton projet Supabase
-- (Dashboard > SQL Editor > New query > coller > Run).
-- Le script est ré-exécutable sans erreur si besoin.

create table if not exists activites (
  id text primary key,
  nom text not null,
  description text default '',
  visuel text,
  created_at timestamptz not null default now()
);

create table if not exists types_record (
  id text primary key,
  activite_id text not null references activites(id) on delete cascade,
  nom text not null,
  mode text not null check (mode in ('record', 'cumul')),
  unite_saisie text not null,
  unite text not null,
  multiplicateur numeric not null default 1,
  sens text not null check (sens in ('plus_haut', 'plus_bas')),
  objectif numeric,
  created_at timestamptz not null default now()
);

create table if not exists contributions (
  id text primary key,
  type_record_id text not null references types_record(id) on delete cascade,
  valeur numeric not null,
  date timestamptz not null default now(),
  nouveau_record boolean not null default false,
  objectif_atteint boolean not null default false
);

create table if not exists planning (
  id text primary key,
  date date not null,
  titre text not null,
  lieu text default '',
  description text default ''
);

create table if not exists admin (
  id integer primary key default 1 check (id = 1),
  mot_de_passe text
);

-- Row Level Security ----------------------------------------------------------
-- Lecture et écriture publiques : il n'y a pas d'authentification Supabase,
-- le mot de passe admin est vérifié côté app uniquement (cf. choix "rester simple").
-- N'importe qui connaissant l'URL/la clé anon pourrait donc écrire directement
-- via l'API Supabase en contournant l'interface. Acceptable pour un événement
-- ponctuel, à durcir plus tard avec Supabase Auth si besoin.

alter table activites enable row level security;
alter table types_record enable row level security;
alter table contributions enable row level security;
alter table planning enable row level security;
alter table admin enable row level security;

drop policy if exists "Lecture publique activites" on activites;
drop policy if exists "Ecriture publique activites" on activites;
create policy "Lecture publique activites" on activites for select using (true);
create policy "Ecriture publique activites" on activites for all using (true) with check (true);

drop policy if exists "Lecture publique types_record" on types_record;
drop policy if exists "Ecriture publique types_record" on types_record;
create policy "Lecture publique types_record" on types_record for select using (true);
create policy "Ecriture publique types_record" on types_record for all using (true) with check (true);

drop policy if exists "Lecture publique contributions" on contributions;
drop policy if exists "Ecriture publique contributions" on contributions;
create policy "Lecture publique contributions" on contributions for select using (true);
create policy "Ecriture publique contributions" on contributions for all using (true) with check (true);

drop policy if exists "Lecture publique planning" on planning;
drop policy if exists "Ecriture publique planning" on planning;
create policy "Lecture publique planning" on planning for select using (true);
create policy "Ecriture publique planning" on planning for all using (true) with check (true);

drop policy if exists "Lecture publique admin" on admin;
drop policy if exists "Ecriture publique admin" on admin;
create policy "Lecture publique admin" on admin for select using (true);
create policy "Ecriture publique admin" on admin for all using (true) with check (true);

-- Temps réel : diffuse les changements à tous les appareils connectés ---------

do $$ begin
  alter publication supabase_realtime add table activites;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table types_record;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table contributions;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table planning;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table admin;
exception when duplicate_object then null;
end $$;

-- Données de départ (les 5 activités préconfigurées) ---------------------------

insert into activites (id, nom, description, visuel) values
  ('act-escalade', 'Escalade', 'Chaque voie montée = 10 m. Objectif collectif : atteindre la hauteur du Mont Blanc !', 'mont-blanc'),
  ('act-raquette', 'Sports de raquette', 'Objectif collectif : jouer autant de matchs qu''à Roland Garros !', 'badminton'),
  ('act-laserrun', 'Laser Run', 'Course continue : qui tiendra le plus longtemps et parcourra la plus grande distance ?', 'laser-run'),
  ('act-danse', 'Danse', 'Qui dansera le plus longtemps sans s''arrêter ?', 'disco'),
  ('act-golf', 'Golf', 'Qui frappera le plus de balles ?', 'golf')
on conflict (id) do nothing;

insert into types_record (id, activite_id, nom, mode, unite_saisie, unite, multiplicateur, objectif, sens) values
  ('type-escalade-voies', 'act-escalade', 'Voies montées vers le Mont Blanc', 'cumul', 'voies', 'm', 10, 4810, 'plus_haut'),
  ('type-raquette-matchs', 'act-raquette', 'Matchs joués (objectif Roland Garros)', 'cumul', 'matchs', 'matchs', 1, 127, 'plus_haut'),
  ('type-laserrun-temps', 'act-laserrun', 'Temps de course sans interruption', 'record', 'minutes', 'minutes', 1, null, 'plus_haut'),
  ('type-laserrun-distance', 'act-laserrun', 'Distance parcourue', 'record', 'tours', 'm', 400, null, 'plus_haut'),
  ('type-danse-temps', 'act-danse', 'Temps dansé sans interruption', 'record', 'minutes', 'minutes', 1, null, 'plus_haut'),
  ('type-golf-balles', 'act-golf', 'Balles frappées', 'record', 'balles', 'balles', 1, null, 'plus_haut')
on conflict (id) do nothing;
