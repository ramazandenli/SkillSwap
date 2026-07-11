import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { EventDto } from '@skillswap/shared';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/Avatar';
import { useAuth } from '@/auth/AuthContext';
import { useAcceptEvent, useCancelEvent, useCompleteEvent, useUserEvents } from './hooks';
import { CompletedEventActions } from './CompletedEventActions';

const STATUS_LABEL: Record<EventDto['status'], string> = {
  waiting: 'Waiting',
  accepted: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

const STATUS_STYLE: Record<EventDto['status'], string> = {
  waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
  accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
  completed: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200',
};

export function EventsSection({ username }: { username: string }) {
  const { user: me } = useAuth();
  const events = useUserEvents(username);
  const accept = useAcceptEvent();
  const complete = useCompleteEvent();
  const cancel = useCancelEvent();

  const grouped = useMemo(() => {
    const all = events.data ?? [];
    return {
      incoming: all.filter((e) => e.status === 'waiting' && e.role === 'target'),
      sent: all.filter(
        (e) =>
          e.role === 'requester' && (e.status === 'waiting' || e.status === 'rejected'),
      ),
      active: all.filter((e) => e.status === 'accepted'),
      done: all.filter((e) => e.status === 'completed'),
    };
  }, [events.data]);

  const isSelf = me?.username === username;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="mb-3">
        <h2 className="text-lg font-semibold">{isSelf ? 'Your' : `${username}'s`} events</h2>
        <p className="text-xs text-slate-500">
          Requests, active sessions and finished swaps.
        </p>
      </header>

      {events.isPending ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : !events.data?.length ? (
        <p className="text-sm text-slate-500">No events yet.</p>
      ) : (
        <div className="space-y-4">
          {isSelf && grouped.incoming.length > 0 && (
            <Group title="Incoming requests">
              {grouped.incoming.map((e) => (
                <EventRow
                  key={e.id}
                  event={e}
                  actions={
                    <>
                      <Button
                        size="sm"
                        onClick={() => accept.mutate(e.id)}
                        loading={accept.isPending}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancel.mutate(e.id)}
                        loading={cancel.isPending}
                      >
                        Reject
                      </Button>
                    </>
                  }
                />
              ))}
            </Group>
          )}

          {isSelf && grouped.sent.length > 0 && (
            <Group title="Sent requests">
              {grouped.sent.map((e) => (
                <EventRow
                  key={e.id}
                  event={e}
                  actions={
                    e.status === 'waiting' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancel.mutate(e.id)}
                        loading={cancel.isPending}
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancel.mutate(e.id)}
                        loading={cancel.isPending}
                      >
                        Dismiss
                      </Button>
                    )
                  }
                />
              ))}
            </Group>
          )}

          {grouped.active.length > 0 && (
            <Group title="Active">
              {grouped.active.map((e) => (
                <EventRow
                  key={e.id}
                  event={e}
                  actions={
                    isSelf ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => complete.mutate(e.id)}
                        loading={complete.isPending}
                      >
                        Mark completed
                      </Button>
                    ) : null
                  }
                />
              ))}
            </Group>
          )}

          {grouped.done.length > 0 && (
            <Group title="Completed">
              {grouped.done.map((e) => (
                <EventRow
                  key={e.id}
                  event={e}
                  actions={isSelf ? <CompletedEventActions event={e} /> : null}
                />
              ))}
            </Group>
          )}
        </div>
      )}
    </section>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
        {title}
      </p>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function EventRow({ event, actions }: { event: EventDto; actions: React.ReactNode }) {
  const other = event.role === 'requester' ? event.target : event.requester;
  const gainSkill = event.role === 'requester' ? event.targetSkill : event.requesterSkill;
  const giveSkill = event.role === 'requester' ? event.requesterSkill : event.targetSkill;
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <Link to={`/home/${other.username}`} className="flex items-center gap-3">
        <Avatar name={other.name} avatarUrl={other.avatarUrl} size="sm" />
        <div>
          <p className="text-sm font-medium">
            {event.type === 'teach' ? 'Teach' : 'Exchange'} with {other.name}
          </p>
          <p className="text-xs text-slate-500">
            You get <span className="font-medium">{gainSkill.name}</span> · You give{' '}
            <span className="font-medium">{giveSkill.name}</span>
          </p>
          <p className="text-xs text-slate-400">
            {event.startDate} → {event.endDate}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[event.status]}`}>
          {STATUS_LABEL[event.status]}
        </span>
        {actions}
      </div>
    </li>
  );
}
