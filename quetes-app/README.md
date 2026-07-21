# Quêtes — suivi d'habitudes façon Habitica (V2)

App web (React + Vite + Tailwind) packagée en app Android native via Capacitor,
avec compte utilisateur, synchronisation cloud via Supabase, et une couche
"coaching d'habitudes" inspirée d'apps comme uHabits, Habitica, et les apps de
routines/rituels.

## Nouveautés de la V2

- **Questionnaire d'accueil** : choix d'objectifs (forme physique, concentration,
  lecture, travail, sommeil, sérénité) → recommandations d'habitudes automatiques
- **Onglet Suggestions** : accessible à tout moment, propose des habitudes par
  objectif + des **rituels prêts à l'emploi** (matinaux / du soir), ajoutables
  en un clic
- **Calendriers (heatmaps)** : une grille par habitude/quotidienne, comme sur
  uHabits, pour visualiser la régularité dans le temps
- **Tableau de bord** : meilleure série, % du jour, total accompli, taux de
  réussite sur 14 jours, message motivant
- **Thèmes personnalisables** : 5 palettes (Arcane, Forêt, Océan, Aurore, Ardoise)
- **Avatar simplifié** : icône + couleur (pas un éditeur de personnage complet —
  volontairement simplifié pour cette version)
- **Profil** : modifier ses objectifs, son avatar, son thème, se déconnecter

## ⚠️ Mise à jour de la base Supabase (obligatoire)

Si ton projet Supabase existe déjà (V1), va dans **SQL Editor** et exécute le
contenu de `supabase/migration_v2.sql` (en plus de `schema.sql` déjà fait).
Ça ajoute :
- la table `task_logs` (historique quotidien, utilisé pour les calendriers)
- les colonnes `goals`, `onboarded`, `theme`, `avatar_icon`, `avatar_color`
  sur `player_stats`

Si tu pars d'un tout nouveau projet Supabase, exécute `schema.sql` PUIS
`migration_v2.sql`, dans cet ordre.

## Étape 1 — Configurer le projet

```bash
cd quetes-app
npm install
cp .env.example .env
```

Ouvre `.env` et colle tes valeurs Supabase (Project URL + clé publishable,
voir Settings → API Keys / Data API sur ton dashboard Supabase).

## Étape 2 — Tester en local

```bash
npm run dev
```

## Étape 3 — Compiler l'APK via GitHub Actions (sans rien installer)

Comme la connexion peut être limitée, ce projet inclut un fichier
`.github/workflows/build-android.yml` qui fait compiler l'APK **dans le cloud
GitHub**, gratuitement. Tu ne télécharges que le petit fichier `.apk` final.

1. Crée un compte sur https://github.com et un nouveau dépôt (ex: `quetes-app`)
2. Upload tout le contenu de ce dossier **sauf** `node_modules` (bouton
   "uploading an existing file" sur la page du dépôt)
3. Dans le dépôt : **Settings → Secrets and variables → Actions** → ajoute
   deux secrets : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
4. Onglet **Actions** → "Build APK Android" → **Run workflow**
5. Une fois terminé (✓ vert), ouvre le run → section **Artifacts** en bas →
   télécharge `quetes-apk`, décompresse, transfère le `.apk` sur ton téléphone,
   installe-le

(Si tu as déjà de la place et une bonne connexion, tu peux toujours utiliser
Android Studio en local avec `npx cap open android` — voir la V1 du README
si besoin, la méthode n'a pas changé.)

## Structure du projet

```
src/
  lib/gameLogic.js        formules XP / or / PV / dégâts / cron quotidien
  lib/stats.js            calculs du tableau de bord et des calendriers
  lib/contentLibrary.js   objectifs, habitudes suggérées, rituels
  lib/themes.js           palettes de thèmes + avatars
  lib/supabase.js         client Supabase
  context/AuthContext     connexion / inscription / session
  context/GameContext     charge joueur + tâches + historique, expose les actions
  components/             écrans et éléments d'interface
supabase/
  schema.sql              schéma de base (V1)
  migration_v2.sql         migration V2 (historique, profil, thème, avatar)
android/                  projet Android natif généré par Capacitor
.github/workflows/        compilation automatique de l'APK dans le cloud
```

## Prochaines pistes (V3 possible)

- Notifications de rappel programmées (matin/soir)
- Sous-tâches / checklists à l'intérieur d'une tâche
- Statistiques par catégorie d'objectif (pas seulement globales)
- Export/partage de série (image à partager)
- Mode hors-ligne avec file d'attente de synchronisation

---

## V3 — Nouveautés

- **Rituels personnalisés** : crée tes propres rituels (matin/soir), en plus
  des rituels prédéfinis, depuis l'onglet Suggestions
- **Sous-tâches / checklists** : ajoute des étapes à l'intérieur d'une
  quotidienne ou d'un à-faire
- **Catégories par objectif** : classe tes tâches par objectif, filtre le
  tableau de bord par catégorie
- **Rappels programmés** : notifications natives matin/soir ou heure
  personnalisée par quotidienne (fonctionne uniquement dans l'app Android
  installée, pas dans le navigateur — la permission est demandée au premier
  lancement)
- **Partage de série** : génère et partage une image de tes statistiques

### ⚠️ Nouvelle migration Supabase obligatoire

Exécute `supabase/migration_v3.sql` dans le SQL Editor (après schema.sql et
migration_v2.sql). Elle ajoute :
- les colonnes `checklist`, `category`, `reminder_time` sur `tasks`
- la table `rituals` (rituels personnalisés)

### Volontairement laissé de côté

Le **mode hors-ligne avec file de synchronisation** n'est pas inclus dans
cette version — l'app nécessite une connexion internet pour fonctionner
(comme la plupart des apps à compte cloud). C'est un chantier à part entière
(gestion de conflits, file d'attente, détection de reconnexion) qui mériterait
sa propre itération plutôt que d'être ajouté rapidement ici.
