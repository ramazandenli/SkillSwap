import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCreateReview } from './hooks';

type Props = {
  open: boolean;
  onClose: () => void;
  eventId: string;
  peerName: string;
};

export function ReviewModal({ open, onClose, eventId, peerName }: Props) {
  const [rating, setRating] = useState<number>(5);
  const [hover, setHover] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const create = useCreateReview(eventId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ rating, comment: comment.trim() || null });
      onClose();
    } catch (err) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed',
      );
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Review ${peerName}`}>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center justify-center gap-1 text-3xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setRating(n)}
              className={
                (hover ?? rating) >= n
                  ? 'text-amber-400 transition-transform hover:scale-110'
                  : 'text-slate-300 transition-transform hover:scale-110 dark:text-slate-700'
              }
              aria-label={`${n} star`}
            >
              ★
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Comment (optional)</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="How was your experience?"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/50">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Post review
          </Button>
        </div>
      </form>
    </Modal>
  );
}
