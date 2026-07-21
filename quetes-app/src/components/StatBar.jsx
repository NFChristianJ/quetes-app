import { xpToNextLevel } from '../lib/gameLogic';

export default function StatBar({ player, onSignOut }) {
  if (!player) return null;
  const xpNeeded = xpToNextLevel(player.level);
  const xpPct = Math.min(100, Math.round((player.xp / xpNeeded) * 100));
  const hpPct = Math.min(100, Math.round((player.hp / player.maxHp) * 100));

  return (
    <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur border-b border-hairline">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="relative flex-none">
          <div className="h-11 w-11 rounded-full border-2 border-gold bg-void flex items-center justify-center">
            <span className="font-mono-num text-gold font-bold text-sm">{player.level}</span>
          </div>
          <span className="absolute -bottom-1 -right-1 text-[9px] uppercase tracking-wide bg-gold text-ink px-1 rounded-sm font-bold">
            Niv
          </span>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <Meter
            label="PV"
            value={player.hp}
            max={player.maxHp}
            pct={hpPct}
            color="bg-wound"
          />
          <Meter
            label="XP"
            value={player.xp}
            max={xpNeeded}
            pct={xpPct}
            color="bg-arcane"
          />
        </div>

        <div className="flex-none flex items-center gap-1 font-mono-num text-gold font-bold text-sm">
          <span>{player.gold}</span>
          <span className="text-xs">or</span>
        </div>

        <button
          onClick={onSignOut}
          className="flex-none text-parchment-dim hover:text-parchment text-xs border border-hairline rounded-md px-2 py-1.5 transition"
        >
          Sortir
        </button>
      </div>
    </div>
  );
}

function Meter({ label, value, max, pct, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-[10px] uppercase tracking-wide text-parchment-dim flex-none">
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full bg-void overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono-num text-[10px] text-parchment-dim flex-none w-14 text-right">
        {value}/{max}
      </span>
    </div>
  );
}
