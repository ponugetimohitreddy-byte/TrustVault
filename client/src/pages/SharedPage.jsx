import { useEffect, useState } from 'react';
import api from '../api/client';
import DocumentTable from '../components/DocumentTable';
import EmptyState from '../components/EmptyState';
import { errorMessage } from '../utils/format';

export default function SharedPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/documents', { params: { scope: 'shared', limit: 50 } })
      .then((res) => setItems(res.data.items))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Shared with me</h1>
        <p className="mt-1 text-stone-600">Documents where you have explicit viewer or editor access.</p>
      </header>
      {error ? <p className="text-rose-700">{error}</p> : null}
      {items.length ? <DocumentTable documents={items} /> : <EmptyState title="Nothing shared yet" body="Ask a publisher or administrator to grant access." />}
    </div>
  );
}
