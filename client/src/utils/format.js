export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export function roleLabel(role) {
  const map = {
    publisher: 'Publisher',
    editor: 'Editor',
    viewer: 'Viewer',
    admin: 'Administrator',
    'org-viewer': 'Org viewer',
    none: 'No access',
  };
  return map[role] || role;
}

export function errorMessage(err, fallback = 'Something went wrong') {
  return err?.response?.data?.error?.message || err?.message || fallback;
}
