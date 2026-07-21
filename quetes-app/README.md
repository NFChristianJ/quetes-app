# Quêtes — suivi d'habitudes façon Habitica

App web (React + Vite + Tailwind) packagée en app Android native via Capacitor,
avec compte utilisateur et synchronisation cloud via Supabase.

## Ce que fait l'app (version 1)

- **Habitudes** : boutons +/− qui donnent XP/or ou infligent des dégâts
- **Quotidiennes** : cases à cocher réinitialisées chaque jour, avec séries (streaks)
  et dégâts automatiques si tu en oublies une (comme le "cron" de Habitica)
- **À faire** : tâches ponctuelles, avec échéance optionnelle
- **Récompenses** : objets personnalisés que tu débloques avec ton or
- **Personnage** : niveau, PV, XP, or — la barre en haut de l'écran

Volontairement laissé pour une V2 (tu as choisi le cœur du jeu solo d'abord) :
guildes, groupes, défis, objets d'équipement, animaux de compagnie.

---

## Étape 1 — Créer ton backend Supabase (gratuit)

1. Va sur https://supabase.com → crée un compte → "New project"
2. Une fois le projet créé, va dans **SQL Editor** → colle le contenu du fichier
   `supabase/schema.sql` (fourni dans ce projet) → **Run**
   → ça crée les tables `player_stats` et `tasks`, avec la sécurité (chacun ne
   voit que ses propres données) et la création automatique d'une fiche
   personnage à l'inscription.
3. Va dans **Project Settings → API** → note :
   - `Project URL`
   - `anon public key`

## Étape 2 — Configurer le projet

```bash
cd quetes-app
npm install
cp .env.example .env
```

Ouvre `.env` et colle tes valeurs Supabase :

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=ta-clé-anon
```

## Étape 3 — Tester en local (dans le navigateur)

```bash
npm run dev
```

Ouvre l'adresse affichée (en général http://localhost:5173), crée un compte,
ajoute quelques tâches. Vérifie que tout fonctionne avant de passer à Android.

## Étape 4 — Générer l'APK Android

Ceci se fait chez toi (pas dans un environnement en ligne), car ça nécessite
Android Studio :

1. Installe **Android Studio** : https://developer.android.com/studio
   (installe aussi le SDK proposé par défaut à la première ouverture)
2. À chaque fois que tu modifies le code de l'app :
   ```bash
   npm run build
   npx cap sync android
   ```
3. Ouvre le projet Android dans Android Studio :
   ```bash
   npx cap open android
   ```
   (ou ouvre directement le dossier `android/` depuis Android Studio)
4. Laisse Android Studio synchroniser Gradle (barre de progression en bas,
   première fois ça peut prendre plusieurs minutes)
5. Pour installer directement sur ton téléphone branché en USB (débogage USB
   activé dans les options développeur) : bouton ▶️ **Run** en haut
6. Pour obtenir un fichier `.apk` à transférer manuellement :
   **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   → le fichier apparaît dans `android/app/build/outputs/apk/debug/`
   → transfère-le sur ton téléphone et installe-le (autorise "sources
   inconnues" si Android le demande)

## Structure du projet

```
src/
  lib/gameLogic.js       formules XP / or / PV / dégâts / cron quotidien
  lib/supabase.js        client Supabase
  context/AuthContext    connexion / inscription / session
  context/GameContext    charge le joueur + les tâches, expose les actions
  components/            écrans et éléments d'interface
supabase/schema.sql      à exécuter une fois dans Supabase
android/                 projet Android natif généré par Capacitor
```

## Prochaines pistes (V2)

- Notifications quotidiennes de rappel (plugin Capacitor Local Notifications)
- Historique / calendrier des quotidiennes
- Personnalisation de l'avatar
- Mode hors-ligne avec file d'attente de synchronisation
