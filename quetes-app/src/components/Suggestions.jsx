import { useState } from 'react';
import { GOALS, SUGGESTIONS, RITUALS } from '../lib/contentLibrary';
import { useGame } from '../context/GameContext';
import RitualBuilder from './RitualBuilder';

export default function Suggestions() {
  const { addTask, rituals, createRitual, deleteRitual, applyRitual } = useGame();
  const [activeGoal, setActiveGoal] = useState(GOALS[0].key);
  const [showBuilder, setShowBuilder] = useState(false);

  const addSuggestion = (s) => {
    addTask({
      type: s.type,
      title: s.title,
      difficulty: s.difficulty,
      positive: true,
      negative: false,
    });
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-sm tracking-wider text-gold uppercase mb-2.5">
          Idées par objectif
        </h2>
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2">
          {GOALS.map((g) => (
            <button
              key={g.key}
              onClick={() => setActiveGoal(g.key)}
              className={`flex-none rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                activeGoal === g.key
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-hairline text-parchment-dim'
              }`}
            >
              {g.icon} {g.label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {(SUGGESTIONS[activeGoal] || []).map((s, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-surface border border-hairline rounded-lg px-3 py-2.5"
            >
              <span className="flex-1 text-sm text-parchment">{s.title}</span>
              <span className="text-[10px] uppercase text-parchment-dim flex-none">
                {s.type === 'daily' ? 'quotidienne' : 'habitude'}
              </span>
              <button
                onClick={() => addSuggestion(s)}
                className="flex-none text-gold text-lg leading-none px-1"
                aria-label="Ajouter"
              >
                +
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="font-display text-sm tracking-wider text-gold uppercase">Rituels</h2>
          <button
            onClick={() => setShowBuilder(true)}
            className="text-xs text-gold border border-gold/40 rounded-full px-2.5 py-1"
          >
            + Créer le mien
          </button>
        </div>

        <div className="space-y-3">
          {[...rituals, ...RITUALS].map((r) => (
            <div key={r.key || r.id} className="bg-surface border border-hairline rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-parchment">
                  {r.moment === 'matin' ? '🌅 ' : r.moment === 'soir' ? '🌙 ' : ''}
                  {r.title}
                </p>
                {r.custom && (
                  <button
                    onClick={() => deleteRitual(r.id)}
                    className="text-parchment-dim hover:text-wound text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
              {r.description && <p className="text-xs text-parchment-dim mb-3">{r.description}</p>}
              <ul className="text-xs text-parchment-dim space-y-1 mb-3 list-disc list-inside">
                {r.steps.map((s, i) => (
                  <li key={i}>{s.title}</li>
                ))}
              </ul>
              <button
                onClick={() => applyRitual(r)}
                className="w-full rounded-lg bg-gold/10 border border-gold/40 text-gold text-xs font-semibold py-2"
              >
                Ajouter ce rituel ({r.steps.length} tâches)
              </button>
            </div>
          ))}
        </div>
      </section>

      {showBuilder && (
        <RitualBuilder onClose={() => setShowBuilder(false)} onCreate={createRitual} />
      )}
    </div>
  );
}
