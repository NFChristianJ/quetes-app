import { DIFFICULTY } from '../lib/gameLogic';

export default function TaskCard({ task, onAction, onDelete }) {
  return (
    <div className="group bg-surface border border-hairline rounded-xl px-3 py-3 flex items-center gap-3">
      {task.type === 'habit' && <HabitControls task={task} onAction={onAction} />}
      {task.type === 'daily' && <CheckControl done={task.completed} onToggle={() => onAction('toggle')} />}
      {task.type === 'todo' && <CheckControl done={false} onToggle={() => onAction('complete')} />}
      {task.type === 'reward' && <RewardControl task={task} onAction={onAction} />}

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.completed ? 'text-parchment-dim line-through' : 'text-parchment'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.type !== 'reward' && (
            <span className="text-[10px] uppercase tracking-wide text-parchment-dim">
              {DIFFICULTY[task.difficulty]?.label}
            </span>
          )}
          {task.type === 'daily' && task.streak > 0 && (
            <span className="text-[10px] font-mono-num text-gold">🔥 {task.streak}</span>
          )}
          {task.type === 'todo' && task.dueDate && (
            <span className="text-[10px] font-mono-num text-parchment-dim">
              échéance {task.dueDate}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onDelete}
        className="flex-none opacity-0 group-hover:opacity-100 text-parchment-dim hover:text-wound text-xs transition px-1"
        aria-label="Supprimer"
      >
        ✕
      </button>
    </div>
  );
}

function HabitControls({ task, onAction }) {
  return (
    <div className="flex-none flex flex-col gap-1">
      {task.negative && (
        <button
          onClick={() => onAction('down')}
          className="h-7 w-7 rounded-lg border border-wound/50 text-wound text-sm font-bold hover:bg-wound/15 transition"
          aria-label="Marquer un écart"
        >
          −
        </button>
      )}
      {task.positive && (
        <button
          onClick={() => onAction('up')}
          className="h-7 w-7 rounded-lg border border-vitality/50 text-vitality text-sm font-bold hover:bg-vitality/15 transition"
          aria-label="Marquer une réussite"
        >
          +
        </button>
      )}
    </div>
  );
}

function CheckControl({ done, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`flex-none h-7 w-7 rounded-md border-2 flex items-center justify-center transition ${
        done ? 'bg-vitality border-vitality text-ink' : 'border-hairline text-transparent hover:border-gold'
      }`}
      aria-label={done ? 'Décocher' : 'Cocher'}
    >
      ✓
    </button>
  );
}

function RewardControl({ task, onAction }) {
  return (
    <button
      onClick={() => onAction('buy')}
      className="flex-none rounded-lg border border-gold/50 text-gold text-xs font-mono-num font-bold px-2.5 py-1.5 hover:bg-gold/15 transition"
    >
      {task.cost} or
    </button>
  );
}
