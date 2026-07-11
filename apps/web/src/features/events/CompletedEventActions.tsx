import { useState } from 'react';
import type { EventDto } from '@skillswap/shared';
import { Button } from '@/components/ui/Button';
import { useMyReviewOnEvent } from '@/features/reviews/hooks';
import { ReviewModal } from '@/features/reviews/ReviewModal';

export function CompletedEventActions({ event }: { event: EventDto }) {
  const existing = useMyReviewOnEvent(event.id);
  const [open, setOpen] = useState(false);
  const peer = event.role === 'requester' ? event.target : event.requester;

  if (existing.isPending) return null;
  if (existing.data) {
    return (
      <span className="text-xs text-amber-500">
        You rated: {'★'.repeat(existing.data.rating)}
      </span>
    );
  }
  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Write review
      </Button>
      {open && (
        <ReviewModal
          open={open}
          onClose={() => setOpen(false)}
          eventId={event.id}
          peerName={peer.name}
        />
      )}
    </>
  );
}
