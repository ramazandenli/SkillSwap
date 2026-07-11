import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { FollowUser } from '@skillswap/shared';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/auth/AuthContext';
import { useFollowCounts, useFollowers, useFollowing } from './hooks';

type Props = {
  username: string;
};

type Tab = 'followers' | 'following';

export function FollowSection({ username }: Props) {
  const [tab, setTab] = useState<Tab>('followers');
  const counts = useFollowCounts(username);
  const followers = useFollowers(tab === 'followers' ? username : undefined);
  const following = useFollowing(tab === 'following' ? username : undefined);

  const active = tab === 'followers' ? followers.data : following.data;
  const isPending = tab === 'followers' ? followers.isPending : following.isPending;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <TabButton active={tab === 'followers'} onClick={() => setTab('followers')}>
          Followers · {counts.data?.followers ?? 0}
        </TabButton>
        <TabButton active={tab === 'following'} onClick={() => setTab('following')}>
          Following · {counts.data?.following ?? 0}
        </TabButton>
      </div>

      {isPending ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : active && active.length > 0 ? (
        <ul className="space-y-2">
          {active.map((u) => (
            <UserRow key={u.id} u={u} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">
          {tab === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
        </p>
      )}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? 'border-b-2 border-brand-500 pb-2 text-sm font-semibold text-brand-500'
          : 'pb-2 text-sm text-slate-500 transition hover:text-slate-800 dark:hover:text-slate-200'
      }
    >
      {children}
    </button>
  );
}

function UserRow({ u }: { u: FollowUser }) {
  const { user: me } = useAuth();
  const isSelf = me?.username === u.username;
  return (
    <li className="flex items-center gap-3">
      <Avatar name={u.name} avatarUrl={u.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <Link
          to={`/home/${u.username}`}
          className="block truncate text-sm font-medium hover:text-brand-500"
        >
          {u.name} {u.surname}
        </Link>
        <p className="text-xs text-slate-500">@{u.username}</p>
      </div>
      {!isSelf && (
        <Link to={`/messages/${u.username}`}>
          <Button size="sm" variant="ghost">
            Message
          </Button>
        </Link>
      )}
    </li>
  );
}
