import Modal from './Modal';

export default function ConfirmDialog({ title, body, confirmLabel = 'Confirm', onConfirm, onClose, danger }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-stone-600">{body}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${danger ? 'bg-rose-700' : 'bg-ink'}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
