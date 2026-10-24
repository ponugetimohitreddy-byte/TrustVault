import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `rounded-xl px-3 py-2 text-sm font-medium ${isActive ? 'bg-ink text-white' : 'text-stone-600 hover:bg-white'}`;

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-stone-200 bg-white/70 p-5 lg:border-b-0 lg:border-r">
        <div className="font-display text-2xl">VaultLedger</div>
        <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">Secure documents</p>
        <nav className="mt-8 flex flex-wrap gap-2 lg:flex-col">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/published" className={linkClass}>
            My published
          </NavLink>
          <NavLink to="/shared" className={linkClass}>
            Shared with me
          </NavLink>
          {isAdmin ? (
            <>
              <NavLink to="/admin" className={linkClass}>
                Administration
              </NavLink>
              <NavLink to="/admin/users" className={linkClass}>
                Users
              </NavLink>
              <NavLink to="/admin/audit" className={linkClass}>
                Audit logs
              </NavLink>
            </>
          ) : null}
        </nav>
        <div className="mt-8 rounded-2xl bg-paper p-4 text-sm">
          <div className="font-semibold">{user?.name}</div>
          <div className="text-stone-500">{user?.email}</div>
          <div className="mt-1 capitalize text-accent">{user?.role}</div>
          <button type="button" onClick={logout} className="mt-4 text-sm font-medium text-stone-600 underline">
            Sign out
          </button>
        </div>
      </aside>
      <main className="p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
