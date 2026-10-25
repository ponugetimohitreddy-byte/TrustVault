import { useEffect, useState } from 'react';
import api from '../api/client';
import { errorMessage, formatDate } from '../utils/format';

export default function AuditLogPage() {
  const [items, setItems] = useState([]);
  const [action, setAction] = useState('');
  const [error, setError] = useState('');

  async function load(nextAction = action) {
    try {
      const res = await api.get('/audit-logs', { params: { action: nextAction || undefined, limit: 50 } });
      setItems(res.data.items);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Audit logs</h1>
        <p className="mt-1 text-stone-600">Sensitive actions are recorded and cannot be edited from this application.</p>
      </header>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          load(action);
        }}
      >
        <input className="max-w-md flex-1 rounded-full border bg-white px-4 py-2" placeholder="Filter by action, e.g. permission.grant" value={action} onChange={(e) => setAction(e.target.value)} />
        <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Filter</button>
      </form>
      {error ? <p className="text-rose-700">{error}</p> : null}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Target</th>
            </tr>
          </thead>
          <tbody>
            {items.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3">{log.actor?.name || '—'}</td>
                <td className="px-4 py-3">{log.document?.title || '—'}</td>
                <td className="px-4 py-3">{log.targetUser?.name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
