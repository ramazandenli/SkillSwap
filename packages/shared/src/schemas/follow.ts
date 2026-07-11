export type FollowUser = {
  id: string;
  username: string;
  name: string;
  surname: string;
  avatarUrl: string | null;
};

export type FollowCounts = {
  followers: number;
  following: number;
};

export type FollowStatus = {
  isFollowing: boolean;
  isFollowedBy: boolean;
};
