const styles = {
  publisher: 'bg-accent/10 text-accent',
  editor: 'bg-moss/10 text-moss',
  viewer: 'bg-sky-100 text-sky-800',
  admin: 'bg-ink/10 text-ink',
  'org-viewer': 'bg-amber-100 text-amber-800',
  private: 'bg-stone-200 text-stone-700',
  restricted: 'bg-orange-100 text-orange-800',
  organization: 'bg-emerald-100 text-emerald-800',
  active: 'bg-emerald-100 text-emerald-800',
  deleted: 'bg-rose-100 text-rose-800',
};

export default function Badge({ value }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[value] || 'bg-stone-100 text-stone-700'}`}>
      {value?.replace('-', ' ')}
    </span>
  );
}
