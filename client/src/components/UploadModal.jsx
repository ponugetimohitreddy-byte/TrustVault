import { useState } from 'react';
import api from '../api/client';
import Modal from './Modal';
import { errorMessage } from '../utils/format';

const VISIBILITY_HELP = {
  private: 'Only you (the publisher) and administrators can open this document.',
  restricted: 'Only people you later grant Viewer or Editor can open it, plus you and administrators.',
  organization: 'Every active employee can read it. Editing still requires Editor access — organization-wide is not edit access.',
};

export default function UploadModal({ onClose, onUploaded, publishers = [], isAdmin }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [allowDownload, setAllowDownload] = useState(true);
  const [publisherId, setPublisherId] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim() || !file) {
      setError('Title and file are required.');
      return;
    }
    const data = new FormData();
    data.append('title', title.trim());
    data.append('description', description);
    data.append('visibility', visibility);
    data.append('allowDownload', String(allowDownload));
    if (isAdmin && publisherId) data.append('publisherId', publisherId);
    data.append('file', file);
    setLoading(true);
    try {
      const res = await api.post('/documents', data);
      onUploaded(res.data.document);
    } catch (err) {
      setError(errorMessage(err, 'Upload failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Publish document" onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        <p className="rounded-xl bg-paper px-3 py-2 text-sm text-stone-600">
          Visibility only controls who can <strong>find and read</strong> the file. Who can <strong>edit</strong> is set later
          on the document page: grant <strong>Viewer</strong> (read) or <strong>Editor</strong> (replace the file).
        </p>
        <label className="block text-sm font-medium">
          Title
          <input className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="block text-sm font-medium">
          Description
          <textarea className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Who can read it
          <select className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="private">Private — only publisher and admin</option>
            <option value="restricted">Restricted — invited people only</option>
            {isAdmin ? <option value="organization">Organization-wide — all employees can read</option> : null}
          </select>
          <span className="mt-1 block text-xs font-normal text-stone-500">{VISIBILITY_HELP[visibility]}</span>
        </label>
        <label className="flex items-start gap-2 text-sm font-medium">
          <input className="mt-1" type="checkbox" checked={allowDownload} onChange={(e) => setAllowDownload(e.target.checked)} />
          <span>
            Allow viewers and editors to download
            <span className="mt-0.5 block text-xs font-normal text-stone-500">
              Turn this off to let people preview in the app only. You and administrators can still download.
            </span>
          </span>
        </label>
        {isAdmin && publishers.length > 0 ? (
          <label className="block text-sm font-medium">
            Publish on behalf of
            <select className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2" value={publisherId} onChange={(e) => setPublisherId(e.target.value)}>
              <option value="">Myself</option>
              {publishers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.email})
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block text-sm font-medium">
          File
          <input className="mt-1 w-full text-sm" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
          <span className="mt-1 block text-xs font-normal text-stone-500">PDF, Office, images, or text. Max 10 MB. To change contents later, download, edit on your computer, then replace with a new version.</span>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm">
            Cancel
          </button>
          <button disabled={loading} className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
