import { useMemo, useState } from 'react';
import { GOALS, SUGGESTIONS, RITUALS } from '../lib/contentLibrary';
import { useGame } from '../context/GameContext';

export default function Onboarding() {
  const { updateProfile, addTasksBulk } = useGame();
  const [step, setStep] = useState('goals');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const suggestions = useMemo(() => {
    const items = [];
    selectedGoals.forEach((g) => {
      (SUGGESTIONS[g] || []).forEach((s) => items.push({ ...s, goal: g }));
    });
    return items;
  }, [selectedGoals]);

  const relevantRituals = useMemo(() => {
    if (selectedGoals.length === 0) return [];
    return RITUALS;
  }, [selectedGoals]);

  const toggleGoal = (key) => {
    setSelectedGoals((prev) =>
      prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]
    );
  };

  const toggleItem = (idx) => {
    setSelectedItems((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const finish = async (itemsToAdd) => {
    if (itemsToAdd.length > 0) {
      await addTasksBulk(
        itemsToAdd.map((s) => ({
          type: s.type,
          title: s.title,
          difficulty: s.difficulty,
          positive: true,
          negative: false,
        }))
      );
    }
    await updateProfile({ goals: selectedGoals, onboarded: true });
  };

  if (step === 'goals') {
    return (
      <Shell
        title="Quels sont tes objectifs ?"
        subtitle="Choisis-en un ou plusieurs — tu pourras changer plus tard."
      >
        <div className="grid grid-cols-2 gap-2.5">
          {GOALS.map((g) => (
            <button
              key={g.key}
              onClick={() => toggleGoal(g.key)}
              className={`rounded-xl border px-3 py-4 text-sm font-medium transition ${
                selectedGoals.includes(g.key)
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-hairline text-parchment-dim'
              }`}
            >
              <div className="text-xl mb-1">{g.icon}</div>
              {g.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => finish([])}
            className="flex-1 rounded-lg border border-hairline text-parchment-dim py-2.5 text-sm"
          >
            Passer
          </button>
          <button
            disabled={selectedGoals.length === 0}
            onClick={() => setStep('suggestions')}
            className="flex-1 rounded-lg bg-gold text-ink font-semibold py-2.5 text-sm disabled:opacity-40"
          >
            Continuer
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      title="Quelques idées pour toi"
      subtitle="Sélectionne ce qui te parle — on les ajoutera à ton suivi."
    >
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {suggestions.map((s, idx) => (
          <label
            key={idx}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition ${
              selectedItems.includes(idx)
                ? 'border-gold bg-gold/10 text-parchment'
                : 'border-hairline text-parchment-dim'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedItems.includes(idx)}
              onChange={() => toggleItem(idx)}
              className="flex-none"
            />
            <span className="flex-1">{s.title}</span>
            <span className="text-[10px] uppercase text-parchment-dim flex-none">
              {s.type === 'daily' ? 'quotidienne' : 'habitude'}
            </span>
          </label>
        ))}
      </div>

      {relevantRituals.length > 0 && (
        <p className="text-xs text-parchment-dim italic">
          Astuce : tu trouveras aussi des rituels prêts à l'emploi (matinaux et du soir) dans
          l'onglet Suggestions, une fois connecté.
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => setStep('goals')}
          className="flex-1 rounded-lg border border-hairline text-parchment-dim py-2.5 text-sm"
        >
          Retour
        </button>
        <button
          onClick={() => finish(selectedItems.map((i) => suggestions[i]))}
          className="flex-1 rounded-lg bg-gold text-ink font-semibold py-2.5 text-sm"
        >
          C'est parti
        </button>
      </div>
    </Shell>
  );
}

function Shell({ title, subtitle, children }) {
  return (
    <div className="min-h-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-surface border border-hairline rounded-2xl p-6 space-y-5">
        <div className="text-center">
          <h1 className="font-display text-lg text-parchment">{title}</h1>
          <p className="text-parchment-dim text-xs mt-1">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
