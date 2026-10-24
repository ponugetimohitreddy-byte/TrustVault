import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import DocumentTable from '../components/DocumentTable';
import EmptyState from '../components/EmptyState';
import UploadModal from '../components/UploadModal';
import { errorMessage } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function PublishedPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    api
      .get('/documents', { params: { scope: 'published', limit: 50 } })
      .then((res) => setItems(res.data.items))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">My published documents</h1>
          <p className="mt-1 text-stone-600">You are the publisher and owner of these records.</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="rounded-full bg-accent px-5 py-2.5 font-semibold text-white">
          Upload
        </button>
      </header>
      {error ? <p className="text-rose-700">{error}</p> : null}
      {items.length ? <DocumentTable documents={items} /> : <EmptyState title="No owned documents" body="Publish a document to manage its access." />}
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
