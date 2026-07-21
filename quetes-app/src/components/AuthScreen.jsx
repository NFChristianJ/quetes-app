import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    const action = mode === 'signin' ? signIn : signUp;
    const { error: err } = await action(email, password);
    setBusy(false);
    if (err) {
      setError(translateError(err.message));
      return;
    }
    if (mode === 'signup') {
      setInfo('Compte créé. Vérifie ta boîte mail si une confirmation est requise, puis connecte-toi.');
      setMode('signin');
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold bg-surface seal-pulse mb-4">
            <span className="font-display text-gold text-xl">Q</span>
          </div>
          <h1 className="font-display text-2xl tracking-wide text-parchment">QUÊTES</h1>
          <p className="text-parchment-dim text-sm mt-1">
            Transforme tes habitudes en aventure
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-surface border border-hairline rounded-2xl p-6 space-y-4"
        >
          <div className="flex rounded-lg bg-void p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-md py-2 font-medium transition ${
                mode === 'signin' ? 'bg-surface-2 text-gold' : 'text-parchment-dim'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-md py-2 font-medium transition ${
                mode === 'signup' ? 'bg-surface-2 text-gold' : 'text-parchment-dim'
              }`}
            >
              Inscription
            </button>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-parchment-dim mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-void border border-hairline px-3 py-2.5 text-parchment focus:outline-none focus:ring-2 focus:ring-gold/60"
              placeholder="toi@exemple.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-parchment-dim mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-void border border-hairline px-3 py-2.5 text-parchment focus:outline-none focus:ring-2 focus:ring-gold/60"
              placeholder="6 caractères minimum"
            />
          </div>

          {error && <p className="text-wound text-sm">{error}</p>}
          {info && <p className="text-vitality text-sm">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-gold text-ink font-semibold py-2.5 hover:brightness-110 transition disabled:opacity-50"
          >
            {busy ? 'Un instant…' : mode === 'signin' ? 'Entrer' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
}

function translateError(msg) {
  if (/invalid login credentials/i.test(msg)) return 'Email ou mot de passe incorrect.';
  if (/already registered/i.test(msg)) return 'Un compte existe déjà avec cet email.';
  if (/password/i.test(msg)) return 'Mot de passe invalide (6 caractères minimum).';
  return msg;
}
