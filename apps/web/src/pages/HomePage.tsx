import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/Avatar';
import { SkillsSection } from '@/features/skills/SkillsSection';
import { MatchesSection } from '@/features/skills/MatchesSection';
import { FollowButton } from '@/features/follow/FollowButton';
import { FollowSection } from '@/features/follow/FollowSection';
import { useFollowCounts } from '@/features/follow/hooks';
import { useUserProfile } from '@/features/profile/hooks';
import { ProfileEditModal } from '@/features/profile/ProfileEditModal';
import { EventsSection } from '@/features/events/EventsSection';
import { ReviewsSection } from '@/features/reviews/ReviewsSection';
import { useUserRating } from '@/features/reviews/hooks';
import { ThemeToggle } from '@/components/ThemeToggle';

export function HomePage() {
  const { username: routeUsername } = useParams<{ username: string }>();
  const { user: me, logout } = useAuth();
  const username = routeUsername ?? me?.username ?? '';
  const isSelf = me?.username === username;
  const profile = useUserProfile(username);
  const counts = useFollowCounts(username);
  const rating = useUserRating(username);
  const [editOpen, setEditOpen] = useState(false);

  const displayUser = isSelf ? me : profile.data;

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-6 py-10">
      {me && !isSelf && (
        <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm dark:border-brand-500/30 dark:bg-brand-500/10">
          <span className="text-slate-700 dark:text-slate-200">
            You're signed in as{' '}
            <Link
              to={`/home/${me.username}`}
              className="font-semibold text-brand-600 hover:underline dark:text-brand-100"
            >
              @{me.username}
            </Link>{' '}
            — viewing @{username}'s profile
          </span>
          <Link
            to={`/home/${me.username}`}
            className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-100"
          >
            Back to my profile →
          </Link>
        </div>
      )}
      <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={displayUser?.name ?? username} avatarUrl={displayUser?.avatarUrl} size="lg" />
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-500">
              {isSelf ? 'Your profile' : `@${username}'s profile`}
            </p>
            <h1 className="text-3xl font-bold">
              {displayUser ? `${displayUser.name} ${displayUser.surname}` : `@${username}`}
            </h1>
            <p className="text-sm text-slate-500">@{username}</p>
            {displayUser?.bio && (
              <p className="mt-1 max-w-md text-sm text-slate-600 dark:text-slate-400">
                {displayUser.bio}
              </p>
            )}
            <p className="mt-2 text-sm text-slate-500">
              {isSelf && (
                <>
                  <span className="font-semibold">{me?.points}</span> pts ·{' '}
                </>
              )}
              <span className="font-semibold">{counts.data?.followers ?? 0}</span> followers ·{' '}
              <span className="font-semibold">{counts.data?.following ?? 0}</span> following
              {(rating.data?.count ?? 0) > 0 && (
                <>
                  {' '}·{' '}
                  <span className="font-semibold text-amber-500">
                    ★ {rating.data!.average.toFixed(1)}
                  </span>{' '}
                  ({rating.data!.count})
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          {isSelf && (
            <>
              <Link to="/messages">
                <Button variant="secondary">Messages</Button>
              </Link>
              <Button variant="secondary" onClick={() => setEditOpen(true)}>
                Edit profile
              </Button>
              <Button variant="ghost" onClick={logout}>
                Log out
              </Button>
            </>
          )}
          {!isSelf && (
            <>
              <Link to={`/messages/${username}`}>
                <Button variant="secondary">Message</Button>
              </Link>
              <FollowButton targetUsername={username} />
            </>
          )}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <SkillsSection
          username={username}
          ownedByCurrentUser={isSelf}
          kind="has"
          title="Skills I can teach"
          helpText="What you're happy to share with others."
        />
        <SkillsSection
          username={username}
          ownedByCurrentUser={isSelf}
          kind="needs"
          title="Skills I want to learn"
          helpText="What you're looking for someone to teach you."
        />
      </div>

      <EventsSection username={username} />

      <ReviewsSection username={username} />

      <FollowSection username={username} />

      {isSelf && <MatchesSection />}

      {isSelf && me && (
        <ProfileEditModal open={editOpen} onClose={() => setEditOpen(false)} user={me} />
      )}
    </main>
  );
}
