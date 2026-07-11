import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { useFollow, useFollowStatus, useUnfollow } from './hooks';

type Props = {
  targetUsername: string;
  size?: 'sm' | 'md';
};

export function FollowButton({ targetUsername, size = 'md' }: Props) {
  const { user } = useAuth();
  const status = useFollowStatus(targetUsername, user?.username);
  const follow = useFollow(targetUsername);
  const unfollow = useUnfollow(targetUsername);

  if (!user || user.username === targetUsername) return null;

  const isFollowing = status.data?.isFollowing ?? false;
  const label = status.isPending ? '...' : isFollowing ? 'Following' : 'Follow';

  return (
    <Button
      size={size}
      variant={isFollowing ? 'secondary' : 'primary'}
      loading={follow.isPending || unfollow.isPending}
      onClick={() => (isFollowing ? unfollow.mutate() : follow.mutate())}
    >
      {label}
    </Button>
  );
}
