import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../utils/format';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={location.state?.from || '/dashboard'} replace />;

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!email.includes('@') || password.length < 8) {
      setError('Enter a valid email and password (8+ characters).');
      return;
    }
    setLoading(true);
    try {
      const nextUser = await login(email, password);
      navigate(nextUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Unable to sign in'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4">
      <div className="grid w-full gap-10 lg:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-accent">Internal access only</p>
          <h1 className="mt-3 font-display text-5xl leading-tight">VaultLedger</h1>
          <p className="mt-4 max-w-md text-lg text-stone-600">
            Publish, share, and control documents with document-specific permissions. Authentication identifies you;
            access is decided per document.
          </p>
        </div>
        <form onSubmit={submit} className="card p-8">
          <h2 className="font-display text-2xl">Sign in</h2>
          {error ? <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          <label className="mt-6 block text-sm font-medium">
            Email
            <input
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Password
            <input
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button disabled={loading} className="mt-6 w-full rounded-full bg-ink py-3 font-semibold text-white disabled:opacity-60">
            {loading ? 'Signing in…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
