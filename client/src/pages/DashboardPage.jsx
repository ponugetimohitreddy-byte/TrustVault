import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import DocumentTable from '../components/DocumentTable';
import EmptyState from '../components/EmptyState';
import UploadModal from '../components/UploadModal';
import { errorMessage } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [q, setQ] = useState('');
  const [published, setPublished] = useState([]);
  const [shared, setShared] = useState([]);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  async function load(search = q) {
    try {
      const [mine, others] = await Promise.all([
        api.get('/documents', { params: { scope: 'published', q: search || undefined, limit: 8 } }),
        api.get('/documents', { params: { scope: 'shared', q: search || undefined, limit: 8 } }),
      ]);
      setPublished(mine.data.items);
      setShared(others.data.items);
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
          <h1 className="font-display text-4xl">Your documents</h1>
          <p className="mt-1 text-stone-600">Published by you and shared with you, with your current access level.</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="rounded-full bg-accent px-5 py-2.5 font-semibold text-white">
          Upload document
        </button>
      </header>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(q);
        }}
        className="flex gap-2"
      >
        <input
          className="w-full max-w-md rounded-full border border-stone-200 bg-white px-4 py-2"
          placeholder="Search title or filename"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Search</button>
      </form>
      {error ? <p className="text-rose-700">{error}</p> : null}

      <section>
        <h2 className="mb-3 font-display text-2xl">Published by you</h2>
        {published.length ? (
          <DocumentTable documents={published} />
        ) : (
          <EmptyState title="Nothing published yet" body="Upload a file to become its publisher and owner." />
        )}
      </section>
      <section>
        <h2 className="mb-3 font-display text-2xl">Shared with you</h2>
        {shared.length ? (
          <DocumentTable documents={shared} />
        ) : (
          <EmptyState title="No shared documents" body="When someone grants you viewer or editor access, it will appear here." />
        )}
      </section>
      {showUpload ? (
        <UploadModal
          isAdmin={isAdmin}
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
