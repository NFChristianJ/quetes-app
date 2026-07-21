// Bibliothèque de suggestions : objectifs -> habitudes / quotidiennes / rituels
// Utilisée par le questionnaire d'accueil ET par l'onglet "Suggestions".

export const GOALS = [
  { key: 'forme', label: 'Forme physique', icon: '💪' },
  { key: 'concentration', label: 'Concentration', icon: '🎯' },
  { key: 'lecture', label: 'Lecture', icon: '📚' },
  { key: 'travail', label: 'Travail & productivité', icon: '💼' },
  { key: 'sommeil', label: 'Sommeil & repos', icon: '🌙' },
  { key: 'sérénité', label: 'Sérénité & calme', icon: '🧘' },
];

// type: 'habit' | 'daily'  |  moment: 'matin' | 'soir' | null
export const SUGGESTIONS = {
  forme: [
    { title: '30 minutes de marche', type: 'daily', difficulty: 'facile', moment: null },
    { title: 'Séance de sport', type: 'daily', difficulty: 'moyen', moment: null },
    { title: 'Boire un grand verre d\'eau au réveil', type: 'daily', difficulty: 'trivial', moment: 'matin' },
    { title: '10 minutes d\'étirements', type: 'daily', difficulty: 'facile', moment: 'soir' },
    { title: 'Prendre les escaliers plutôt que l\'ascenseur', type: 'habit', difficulty: 'facile', moment: null },
  ],
  concentration: [
    { title: 'Session de travail sans téléphone (25 min)', type: 'daily', difficulty: 'moyen', moment: null },
    { title: 'Faire une seule tâche à la fois', type: 'habit', difficulty: 'moyen', moment: null },
    { title: '5 minutes de respiration avant de commencer', type: 'daily', difficulty: 'trivial', moment: 'matin' },
    { title: 'Couper les notifications pendant le travail profond', type: 'habit', difficulty: 'facile', moment: null },
  ],
  lecture: [
    { title: 'Lire 10 pages', type: 'daily', difficulty: 'facile', moment: null },
    { title: 'Lire 20 minutes avant de dormir', type: 'daily', difficulty: 'facile', moment: 'soir' },
    { title: 'Noter une idée retenue de ma lecture', type: 'habit', difficulty: 'facile', moment: null },
  ],
  travail: [
    { title: 'Planifier les 3 priorités du jour', type: 'daily', difficulty: 'facile', moment: 'matin' },
    { title: 'Faire le point sur la journée', type: 'daily', difficulty: 'facile', moment: 'soir' },
    { title: 'Répondre aux emails à heure fixe (pas en continu)', type: 'habit', difficulty: 'moyen', moment: null },
    { title: 'Vider la boîte de réception', type: 'daily', difficulty: 'moyen', moment: null },
  ],
  sommeil: [
    { title: 'Écrans coupés 30 min avant de dormir', type: 'daily', difficulty: 'moyen', moment: 'soir' },
    { title: 'Se coucher à heure fixe', type: 'daily', difficulty: 'moyen', moment: 'soir' },
    { title: 'Pas de caféine après 16h', type: 'habit', difficulty: 'facile', moment: null },
  ],
  'sérénité': [
    { title: '5 minutes de méditation', type: 'daily', difficulty: 'facile', moment: 'matin' },
    { title: 'Écrire 3 choses pour lesquelles je suis reconnaissant(e)', type: 'daily', difficulty: 'trivial', moment: 'soir' },
    { title: 'Prendre une pause sans écran', type: 'habit', difficulty: 'facile', moment: null },
  ],
};

// Rituels prêts à l'emploi : groupes de tâches à ajouter en un clic
export const RITUALS = [
  {
    key: 'matinal-energie',
    title: 'Rituel matinal — Énergie',
    moment: 'matin',
    description: 'Un enchaînement simple pour démarrer la journée avec de l\'élan.',
    steps: [
      { title: 'Boire un grand verre d\'eau', difficulty: 'trivial' },
      { title: '5 minutes d\'étirements', difficulty: 'facile' },
      { title: 'Planifier les 3 priorités du jour', difficulty: 'facile' },
    ],
  },
  {
    key: 'matinal-focus',
    title: 'Rituel matinal — Concentration',
    moment: 'matin',
    description: 'Inspiré des routines de "deep work" : calme l\'esprit avant de plonger dans le travail.',
    steps: [
      { title: '5 minutes de respiration', difficulty: 'trivial' },
      { title: 'Écrire la tâche la plus importante du jour', difficulty: 'facile' },
      { title: 'Couper les notifications', difficulty: 'facile' },
    ],
  },
  {
    key: 'vespéral-calme',
    title: 'Rituel du soir — Calme',
    moment: 'soir',
    description: 'Favorise un meilleur sommeil en apaisant le corps et l\'esprit.',
    steps: [
      { title: 'Écrans coupés 30 min avant de dormir', difficulty: 'moyen' },
      { title: 'Écrire 3 choses pour lesquelles je suis reconnaissant(e)', difficulty: 'trivial' },
      { title: 'Lire 10 pages', difficulty: 'facile' },
    ],
  },
  {
    key: 'vespéral-bilan',
    title: 'Rituel du soir — Bilan',
    moment: 'soir',
    description: 'Clôturer sa journée de travail proprement pour mieux décrocher.',
    steps: [
      { title: 'Faire le point sur la journée', difficulty: 'facile' },
      { title: 'Vider la boîte de réception', difficulty: 'moyen' },
      { title: '10 minutes d\'étirements', difficulty: 'facile' },
    ],
  },
];

export const MOTIVATIONAL_MESSAGES = [
  "Chaque petite victoire compte — continue.",
  "La régularité bat l'intensité, jour après jour.",
  "Tu n'as pas besoin d'être parfait, juste constant.",
  "Ta série actuelle est la preuve que tu tiens tes engagements.",
  "Un jour manqué n'efface pas les progrès déjà faits.",
  "Le meilleur moment pour continuer, c'est maintenant.",
];
