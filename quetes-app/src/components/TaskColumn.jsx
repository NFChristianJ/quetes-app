import TaskCard from './TaskCard';

const EMPTY_COPY = {
  habit: "Aucune habitude pour l'instant. Ajoute la première ci-dessus.",
  daily: "Aucune quotidienne. Ajoute une routine à répéter chaque jour.",
  todo: "Aucune tâche en attente. Bien joué, ou ajoutes-en une nouvelle.",
  reward: "Aucune récompense créée. Ajoute quelque chose qui te ferait plaisir.",
};

export default function TaskColumn({ title, type, tasks, onAdd, onAction, onDelete }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="font-display text-sm tracking-wider text-gold uppercase">{title}</h2>
        <button
          onClick={onAdd}
          className="text-parchment-dim hover:text-gold text-lg leading-none transition"
          aria-label={`Ajouter — ${title}`}
        >
          +
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-xs text-parchment-dim italic px-1">{EMPTY_COPY[type]}</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onAction={(action) => onAction(task, action)}
              onDelete={() => onDelete(task.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
