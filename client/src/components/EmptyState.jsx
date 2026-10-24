export default function EmptyState({ title, body, action }) {
  return (
    <div className="card px-8 py-12 text-center">
      <h3 className="font-display text-xl">{title}</h3>
      <p className="mt-2 text-stone-600">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
