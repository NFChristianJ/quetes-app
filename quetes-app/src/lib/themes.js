export const THEMES = {
  arcane: {
    label: 'Arcane (défaut)',
    swatch: '#7C6CE0',
    vars: {
      '--color-ink': '#0F0B24',
      '--color-void': '#14102B',
      '--color-surface': '#1E1840',
      '--color-surface-2': '#291F52',
      '--color-hairline': '#3A2E6E',
      '--color-parchment': '#EDE6D6',
      '--color-parchment-dim': '#B9AF9A',
      '--color-gold': '#E3B54E',
      '--color-gold-dim': '#9A7A2E',
      '--color-vitality': '#3FCB93',
      '--color-wound': '#E85C5C',
      '--color-arcane': '#7C6CE0',
    },
  },
  foret: {
    label: 'Forêt',
    swatch: '#4FA876',
    vars: {
      '--color-ink': '#0A1712',
      '--color-void': '#0F2018',
      '--color-surface': '#173026',
      '--color-surface-2': '#1F3E31',
      '--color-hairline': '#2E5241',
      '--color-parchment': '#EDE9DA',
      '--color-parchment-dim': '#AEB6A9',
      '--color-gold': '#D8B65C',
      '--color-gold-dim': '#96793A',
      '--color-vitality': '#4FA876',
      '--color-wound': '#E0685C',
      '--color-arcane': '#5FB893',
    },
  },
  ocean: {
    label: 'Océan',
    swatch: '#4CA9D9',
    vars: {
      '--color-ink': '#08131C',
      '--color-void': '#0C1E2C',
      '--color-surface': '#123043',
      '--color-surface-2': '#173E58',
      '--color-hairline': '#2A5470',
      '--color-parchment': '#E8F0F5',
      '--color-parchment-dim': '#9FB4C2',
      '--color-gold': '#4CA9D9',
      '--color-gold-dim': '#2E7DA8',
      '--color-vitality': '#3FCBA8',
      '--color-wound': '#E0685C',
      '--color-arcane': '#6C8FE0',
    },
  },
  aurore: {
    label: 'Aurore',
    swatch: '#E38B4E',
    vars: {
      '--color-ink': '#1C0F0A',
      '--color-void': '#26140D',
      '--color-surface': '#3A2013',
      '--color-surface-2': '#4A2A18',
      '--color-hairline': '#5E3A24',
      '--color-parchment': '#F5E9DC',
      '--color-parchment-dim': '#C2A98F',
      '--color-gold': '#E38B4E',
      '--color-gold-dim': '#A85F2E',
      '--color-vitality': '#5FAF7A',
      '--color-wound': '#E0525C',
      '--color-arcane': '#D9634C',
    },
  },
  ardoise: {
    label: 'Ardoise (minimal)',
    swatch: '#9AA3AD',
    vars: {
      '--color-ink': '#101215',
      '--color-void': '#16191D',
      '--color-surface': '#20242A',
      '--color-surface-2': '#2A2F36',
      '--color-hairline': '#3C424B',
      '--color-parchment': '#E9ECEF',
      '--color-parchment-dim': '#9AA3AD',
      '--color-gold': '#C7CDD4',
      '--color-gold-dim': '#8A9199',
      '--color-vitality': '#5FBF8F',
      '--color-wound': '#E0685C',
      '--color-arcane': '#8B96A3',
    },
  },
};

export function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES.arcane;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

export const AVATAR_ICONS = ['🧙', '🦊', '🐉', '🦉', '🐺', '🦁', '🐯', '🦅', '🐢', '🌟', '⚔️', '🛡️'];
export const AVATAR_COLORS = ['#E3B54E', '#7C6CE0', '#4FA876', '#4CA9D9', '#E38B4E', '#E85C5C'];
