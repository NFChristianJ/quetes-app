import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useGame } from './context/GameContext';
import AuthScreen from './components/AuthScreen';
import StatBar from './components/StatBar';
import TaskColumn from './components/TaskColumn';
import NewTaskModal from './components/NewTaskModal';
import Toast from './components/Toast';

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();

  if (authLoading) return <SplashScreen />;
  if (!user) return <AuthScreen />;
  return <GameScreen onSignOut={signOut} />;
}

function GameScreen({ onSignOut }) {
  const {
    player,
    tasks,
    loading,
    toast,
    dismissToast,
    addTask,
    deleteTask,
    scoreHabit,
    toggleDaily,
    completeTodo,
    buyReward,
  } = useGame();
  const [modalType, setModalType] = useState(null);

  if (loading || !player) return <SplashScreen />;

  const byType = (type) => tasks.filter((t) => t.type === type);

  const handleAction = (task, action) => {
    if (task.type === 'habit') return scoreHabit(task, action);
    if (task.type === 'daily') return toggleDaily(task);
    if (task.type === 'todo') return completeTodo(task);
    if (task.type === 'reward') return buyReward(task);
  };

  return (
    <div className="min-h-full pb-16">
      <StatBar player={player} onSignOut={onSignOut} />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        <TaskColumn
          title="Habitudes"
          type="habit"
          tasks={byType('habit')}
          onAdd={() => setModalType('habit')}
          onAction={handleAction}
          onDelete={deleteTask}
        />
        <TaskColumn
          title="Quotidiennes"
          type="daily"
          tasks={byType('daily')}
          onAdd={() => setModalType('daily')}
          onAction={handleAction}
          onDelete={deleteTask}
        />
        <TaskColumn
          title="À faire"
          type="todo"
          tasks={byType('todo')}
          onAdd={() => setModalType('todo')}
          onAction={handleAction}
          onDelete={deleteTask}
        />
        <TaskColumn
          title="Récompenses"
          type="reward"
          tasks={byType('reward')}
          onAdd={() => setModalType('reward')}
          onAction={handleAction}
          onDelete={deleteTask}
        />
      </main>

      {modalType && (
        <NewTaskModal
          type={modalType}
          onClose={() => setModalType(null)}
          onCreate={addTask}
        />
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}

function SplashScreen() {
  return (
    <div className="min-h-full flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );
}
