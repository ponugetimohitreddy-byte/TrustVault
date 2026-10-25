import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import DocumentTable from '../components/DocumentTable';
import UploadModal from '../components/UploadModal';
import { errorMessage, formatDate } from '../utils/format';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [docs, setDocs] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [q, setQ] = useState('');

  async function load(search = q) {
    try {
      const [s, d, u] = await Promise.all([
        api.get('/stats/dashboard'),
        api.get('/documents', { params: { q: search || undefined, limit: 12 } }),
        api.get('/users', { params: { limit: 100, isActive: true } }),
      ]);
      setStats(s.data);
      setDocs(d.data.items);
      setUsers(u.data.items);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Administration</h1>
          <p className="mt-1 text-stone-600">Users, documents, visibility, and audit activity across the organization.</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="rounded-full bg-accent px-5 py-2.5 font-semibold text-white">
          Publish document
        </button>
      </header>
      {error ? <p className="text-rose-700">{error}</p> : null}
      {stats ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <div className="text-sm text-stone-500">Users</div>
            <div className="font-display text-4xl">{stats.totalUsers}</div>
            <div className="text-sm text-moss">{stats.activeUsers} active</div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-stone-500">Documents</div>
            <div className="font-display text-4xl">{stats.totalDocuments}</div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-stone-500">Recent activity</div>
            <div className="font-display text-4xl">{stats.recentActivity.length}</div>
          </div>
        </div>
      ) : null}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          load(q);
        }}
      >
        <input className="max-w-md flex-1 rounded-full border bg-white px-4 py-2" placeholder="Filter documents" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Search</button>
      </form>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl">Documents</h2>
          <Link to="/admin/users" className="text-sm underline">
            Manage users
          </Link>
        </div>
        <DocumentTable documents={docs} />
      </section>

      <section className="card p-6">
        <h2 className="font-display text-2xl">Recent document activity</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(stats?.recentActivity || []).map((item) => (
            <li key={item.id} className="flex flex-wrap justify-between gap-2 border-b border-stone-100 py-2">
              <span>
                {item.action} · {item.document?.title || '—'} · {item.actor?.name || 'system'}
              </span>
              <span className="text-stone-500">{formatDate(item.timestamp)}</span>
            </li>
          ))}
        </ul>
      </section>

      {showUpload ? (
        <UploadModal
          isAdmin
          publishers={users}
          onClose={() => setShowUpload(false)}
          onUploaded={(doc) => {
            setShowUpload(false);
            navigate(`/documents/${doc.id}`);
          }}
        />
      ) : null}
    </div>
  );
}
