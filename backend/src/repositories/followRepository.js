import { query } from "../config/db.js";

export function findFollowers(userId) {
  return query("select * from get_followers($1)", [userId]);
}

export function findFollowings(userId) {
  return query("select * from get_followings($1)", [userId]);
}

export function follow(followerId, followedId) {
  return query("insert into Follows(follower_id, followed_id) values ($1, $2)", [followerId, followedId]);
}

export function unfollow(followerId, followedId) {
  return query("delete from Follows where follower_id = $1 and followed_id = $2", [followerId, followedId]);
}
