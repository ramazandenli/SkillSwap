import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { MatchResult, MatchSort } from '@skillswap/shared';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/Button';
import { useAllSkills, useMatches } from './hooks';
import { FollowButton } from '@/features/follow/FollowButton';
import { RequestEventModal } from '@/features/events/RequestEventModal';

export function MatchesSection() {
  const [skillId, setSkillId] = useState<number | null>(null);
  const [sort, setSort] = useState<MatchSort>('points');
  const [requestTarget, setRequestTarget] = useState<MatchResult | null>(null);
  const allSkills = useAllSkills();
  const matches = useMatches(skillId, sort);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">Find someone to swap with</h2>
        <p className="text-xs text-slate-500">
          Pick a skill you want to learn — we show people who can teach it and who need something you already offer.
        </p>
      </header>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="font-medium">Skill I want to learn</span>
          <select
            value={skillId ?? ''}
            onChange={(e) => setSkillId(e.target.value ? Number(e.target.value) : null)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">-- Select a skill --</option>
            {(allSkills.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as MatchSort)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="points">Points</option>
            <option value="matchCount">Best fit</option>
          </select>
        </label>
      </form>

      <div className="mt-5 space-y-3">
        {skillId === null && (
          <p className="text-sm text-slate-500">Choose a skill to see matches.</p>
        )}
        {skillId !== null && matches.isPending && (
          <p className="text-sm text-slate-500">Searching...</p>
        )}
        {skillId !== null && matches.data?.length === 0 && (
          <p className="text-sm text-slate-500">No matches yet — try another skill.</p>
        )}
        {matches.data?.map((m) => (
          <article
            key={m.id}
            className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <Link to={`/home/${m.username}`} className="flex items-center gap-3">
              <Avatar name={m.name} avatarUrl={m.avatarUrl} size="md" />
              <div>
                <p className="font-semibold">
                  {m.name} {m.surname}
                </p>
                <p className="text-xs text-slate-500">
                  @{m.username} · {m.points} pts · {m.matchCount} of your skills wanted
                </p>
              </div>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/messages/${m.username}`}>
                <Button size="sm" variant="secondary">
                  Message
                </Button>
              </Link>
              <Button size="sm" variant="secondary" onClick={() => setRequestTarget(m)}>
                Request swap
              </Button>
              <FollowButton targetUsername={m.username} size="sm" />
            </div>
          </article>
        ))}
      </div>

      {requestTarget && (
        <RequestEventModal
          open={!!requestTarget}
          onClose={() => setRequestTarget(null)}
          targetUsername={requestTarget.username}
          targetName={requestTarget.name}
        />
      )}
    </section>
  );
}
