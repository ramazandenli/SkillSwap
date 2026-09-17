import client from "./client.js";

/** Takip eden taraf token'dan belirleniyor; sadece kimi takip ettigimiz gidiyor. */
export const follow = (followed) => client.post("/follows", { followed });

/**
 * direction: "following" -> onu takip etmeyi birakiyorum
 * direction: "follower"  -> onu takipcilerimden cikariyorum
 */
export const unfollow = (user, direction) =>
  client.delete("/follows", { params: { user, direction } });
