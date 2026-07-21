import { useState } from 'react';
import { DIFFICULTY } from '../lib/gameLogic';
import { GOALS } from '../lib/contentLibrary';

export default function NewTaskModal({ type, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('facile');
  const [positive, setPositive] = useState(true);
  const [negative, setNegative] = useState(true);
  const [dueDate, setDueDate] = useState('');
  const [cost, setCost] = useState(20);
  const [category, setCategory] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [checklistDraft, setChecklistDraft] = useState('');

  const labels = {
    habit: 'Nouvelle habitude',
    daily: 'Nouvelle quotidienne',
    todo: 'Nouvelle tâche',
    reward: 'Nouvelle récompense',
  };

  const addChecklistItem = () => {
    if (!checklistDraft.trim()) return;
    setChecklist((prev) => [...prev, { title: checklistDraft.trim(), done: false }]);
    setChecklistDraft('');
  };

  const removeChecklistItem = (idx) => {
    setChecklist((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({
      type,
      title: title.trim(),
      difficulty,
      positive: type === 'habit' ? positive : true,
      negative: type === 'habit' ? negative : false,
      dueDate: type === 'todo' && dueDate ? dueDate : null,
      cost: type === 'reward' ? Number(cost) || 0 : null,
      category: category || null,
      reminderTime: type === 'daily' && reminderTime ? reminderTime : null,
      checklist: type === 'todo' || type === 'daily' ? checklist : [],
    });
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
          {labels[type]}
        </h3>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nom"
          className="w-full rounded-lg bg-void border border-hairline px-3 py-2.5 text-parchment focus:outline-none focus:ring-2 focus:ring-gold/60"
        />

        {type === 'reward' ? (
          <div>
            <label className="block text-xs uppercase tracking-wide text-parchment-dim mb-1">
              Coût en or
            </label>
            <input
              type="number"
              min={1}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full rounded-lg bg-void border border-hairline px-3 py-2.5 text-parchment focus:outline-none focus:ring-2 focus:ring-gold/60"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs uppercase tracking-wide text-parchment-dim mb-1">
              Difficulté
            </label>
            <div className="flex gap-1.5">
              {Object.entries(DIFFICULTY).map(([key, d]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`flex-1 text-xs rounded-lg py-2 border transition ${
                    difficulty === key
                      ? 'border-gold text-gold bg-gold/10'
                      : 'border-hairline text-parchment-dim'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {type !== 'reward' && (
          <div>
            <label className="block text-xs uppercase tracking-wide text-parchment-dim mb-1">
              Catégorie (optionnel)
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCategory('')}
                className={`text-xs rounded-full px-2.5 py-1 border transition ${
                  category === '' ? 'border-gold text-gold bg-gold/10' : 'border-hairline text-parchment-dim'
                }`}
              >
                Aucune
              </button>
              {GOALS.map((g) => (
                <button
                  type="button"
                  key={g.key}
                  onClick={() => setCategory(g.key)}
                  className={`text-xs rounded-full px-2.5 py-1 border transition ${
                    category === g.key ? 'border-gold text-gold bg-gold/10' : 'border-hairline text-parchment-dim'
                  }`}
                >
                  {g.icon} {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {type === 'habit' && (
          <div className="flex gap-4 text-sm text-parchment-dim">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={positive} onChange={(e) => setPositive(e.target.checked)} />
              Sens positif (+)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={negative} onChange={(e) => setNegative(e.target.checked)} />
              Sens négatif (−)
            </label>
          </div>
        )}

        {type === 'todo' && (
          <div>
            <label className="block text-xs uppercase tracking-wide text-parchment-dim mb-1">
              Échéance (optionnel)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg bg-void border border-hairline px-3 py-2.5 text-parchment focus:outline-none focus:ring-2 focus:ring-gold/60"
            />
          </div>
        )}

        {type === 'daily' && (
          <div>
            <label className="block text-xs uppercase tracking-wide text-parchment-dim mb-1">
              Rappel quotidien (optionnel)
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full rounded-lg bg-void border border-hairline px-3 py-2.5 text-parchment focus:outline-none focus:ring-2 focus:ring-gold/60"
            />
            <p className="text-[10px] text-parchment-dim mt-1">
              Fonctionne uniquement dans l'app Android installée, pas dans le navigateur.
            </p>
          </div>
        )}

        {(type === 'todo' || type === 'daily') && (
          <div>
            <label className="block text-xs uppercase tracking-wide text-parchment-dim mb-1">
              Sous-tâches (optionnel)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                value={checklistDraft}
                onChange={(e) => setChecklistDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addChecklistItem();
                  }
                }}
                placeholder="Ajouter une étape"
                className="flex-1 rounded-lg bg-void border border-hairline px-3 py-2 text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-gold/60"
              />
              <button
                type="button"
                onClick={addChecklistItem}
                className="rounded-lg border border-gold/40 text-gold px-3 text-sm"
              >
                +
              </button>
            </div>
            {checklist.length > 0 && (
              <ul className="space-y-1">
                {checklist.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between text-xs text-parchment-dim bg-void rounded px-2 py-1.5"
                  >
                    {item.title}
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(idx)}
                      className="text-wound"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-hairline text-parchment-dim py-2.5 text-sm hover:text-parchment transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 rounded-lg bg-gold text-ink font-semibold py-2.5 text-sm hover:brightness-110 transition"
          >
            Créer
          </button>
        </div>
      </form>
    </div>
  );
}
