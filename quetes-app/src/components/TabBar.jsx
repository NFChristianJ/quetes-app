const TABS = [
  { key: 'tasks', label: 'Tâches', icon: '📜' },
  { key: 'dashboard', label: 'Tableau de bord', icon: '📊' },
  { key: 'suggestions', label: 'Suggestions', icon: '✨' },
  { key: 'profile', label: 'Profil', icon: '👤' },
];

export default function TabBar({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-surface/95 backdrop-blur border-t border-hairline">
      <div className="max-w-3xl mx-auto grid grid-cols-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition ${
              active === tab.key ? 'text-gold' : 'text-parchment-dim'
            }`}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
