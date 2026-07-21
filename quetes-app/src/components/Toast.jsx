import { useEffect } from 'react';

const STYLES = {
  success: 'border-vitality/60 text-vitality',
  danger: 'border-wound/60 text-wound',
  warning: 'border-gold/60 text-gold',
  info: 'border-arcane/60 text-arcane',
};

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-sm">
      <div
        className={`bg-surface border rounded-xl px-4 py-3 text-sm font-medium text-center shadow-lg ${STYLES[toast.kind] || STYLES.info}`}
      >
        {toast.message}
      </div>
    </div>
  );
}
