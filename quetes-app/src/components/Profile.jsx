import { useGame } from '../context/GameContext';
import { THEMES } from '../lib/themes';
import { AVATAR_ICONS, AVATAR_COLORS } from '../lib/themes';
import { GOALS } from '../lib/contentLibrary';

export default function Profile({ onSignOut }) {
  const { player, updateProfile } = useGame();

  const toggleGoal = (key) => {
    const goals = player.goals.includes(key)
      ? player.goals.filter((g) => g !== key)
      : [...player.goals, key];
    updateProfile({ goals });
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col items-center gap-3">
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center text-4xl border-2"
          style={{ borderColor: player.avatarColor, backgroundColor: `${player.avatarColor}22` }}
        >
          {player.avatarIcon}
        </div>
        <p className="font-mono-num text-sm text-parchment-dim">Niveau {player.level}</p>
      </section>

      <section>
        <h2 className="font-display text-sm tracking-wider text-gold uppercase mb-2.5">
          Avatar
        </h2>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {AVATAR_ICONS.map((icon) => (
            <button
              key={icon}
              onClick={() => updateProfile({ avatarIcon: icon })}
              className={`h-10 rounded-lg text-xl flex items-center justify-center border transition ${
                player.avatarIcon === icon ? 'border-gold bg-gold/10' : 'border-hairline'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => updateProfile({ avatarColor: color })}
              className="h-8 w-8 rounded-full border-2 transition"
              style={{
                backgroundColor: color,
                borderColor: player.avatarColor === color ? '#EDE6D6' : 'transparent',
              }}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-sm tracking-wider text-gold uppercase mb-2.5">
          Thème
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(THEMES).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => updateProfile({ theme: key })}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs transition ${
                player.theme === key ? 'border-gold bg-gold/10 text-parchment' : 'border-hairline text-parchment-dim'
              }`}
            >
              <span
                className="h-4 w-4 rounded-full flex-none"
                style={{ backgroundColor: theme.swatch }}
              />
              {theme.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-sm tracking-wider text-gold uppercase mb-2.5">
          Objectifs
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.key}
              onClick={() => toggleGoal(g.key)}
              className={`rounded-lg border px-3 py-2.5 text-xs transition ${
                player.goals.includes(g.key)
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-hairline text-parchment-dim'
              }`}
            >
              {g.icon} {g.label}
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={onSignOut}
        className="w-full rounded-lg border border-wound/40 text-wound py-2.5 text-sm"
      >
        Se déconnecter
      </button>
    </div>
  );
}
