import { useState } from 'react';
import { DIFFICULTY } from '../lib/gameLogic';

export default function RitualBuilder({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [moment, setMoment] = useState('matin');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([]);
  const [stepDraft, setStepDraft] = useState('');
  const [stepDifficulty, setStepDifficulty] = useState('facile');

  const addStep = () => {
    if (!stepDraft.trim()) return;
    setSteps((prev) => [...prev, { title: stepDraft.trim(), difficulty: stepDifficulty }]);
    setStepDraft('');
  };

  const removeStep = (idx) => setSteps((prev) => prev.filter((_, i) => i !== idx));

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || steps.length === 0) return;
    onCreate({ title: title.trim(), moment, description: description.trim(), steps });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-ink/70 backdrop-blur-sm z-30 flex items-end sm:items-center justify-center px-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-surface border border-hairline rounded-2xl p-5 space-y-4 mb-4 sm:mb-0 max-h-[85vh] overflow-y-auto"
      >
        <h3 className="font-display text-gold text-sm tracking-wide uppercase">
          Créer un rituel
        </h3>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nom du rituel"
          className="w-full rounded-lg bg-void border border-hairline px-3 py-2.5 text-parchment focus:outline-none focus:ring-2 focus:ring-gold/60"
        />

        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className="w-full rounded-lg bg-void border border-hairline px-3 py-2.5 text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-gold/60"
        />

        <div>
          <label className="block text-xs uppercase tracking-wide text-parchment-dim mb-1">
            Moment
          </label>
          <div className="flex gap-1.5">
            {[
              { key: 'matin', label: '🌅 Matin' },
              { key: 'soir', label: '🌙 Soir' },
            ].map((m) => (
              <button
                type="button"
                key={m.key}
                onClick={() => setMoment(m.key)}
                className={`flex-1 text-xs rounded-lg py-2 border transition ${
                  moment === m.key ? 'border-gold text-gold bg-gold/10' : 'border-hairline text-parchment-dim'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-parchment-dim mb-1">
            Étapes
          </label>
          <div className="flex gap-1.5 mb-2">
            <input
              value={stepDraft}
              onChange={(e) => setStepDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addStep();
                }
              }}
              placeholder="Nom de l'étape"
              className="flex-1 rounded-lg bg-void border border-hairline px-3 py-2 text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-gold/60"
            />
            <select
              value={stepDifficulty}
              onChange={(e) => setStepDifficulty(e.target.value)}
              className="rounded-lg bg-void border border-hairline px-2 text-xs text-parchment-dim"
            >
              {Object.entries(DIFFICULTY).map(([key, d]) => (
                <option key={key} value={key}>
                  {d.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addStep}
              className="rounded-lg border border-gold/40 text-gold px-3 text-sm"
            >
              +
            </button>
          </div>
          {steps.length > 0 && (
            <ul className="space-y-1">
              {steps.map((s, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between text-xs text-parchment-dim bg-void rounded px-2 py-1.5"
                >
                  <span>
                    {s.title} <span className="text-parchment-dim/60">— {DIFFICULTY[s.difficulty]?.label}</span>
                  </span>
                  <button type="button" onClick={() => removeStep(idx)} className="text-wound">
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-hairline text-parchment-dim py-2.5 text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!title.trim() || steps.length === 0}
            className="flex-1 rounded-lg bg-gold text-ink font-semibold py-2.5 text-sm disabled:opacity-40"
          >
            Créer le rituel
          </button>
        </div>
      </form>
    </div>
  );
}
