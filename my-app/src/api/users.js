import client from "./client.js";

export const getProfile = (userId) => client.get(`/users/${userId}/profile`);

/** Arama kartlari icin: profil + sahip olunan/ihtiyac duyulan yetenekler. */
export const getUserDetail = (userId) => client.get(`/users/${userId}`);

export const getFollowers = (userId) => client.get(`/users/${userId}/followers`);

export const getFollowings = (userId) => client.get(`/users/${userId}/followings`);

/** type: "has" | "needs" */
export const getSkills = (userId, type) =>
  client.get(`/users/${userId}/skills`, { params: { type } });

export const addSkill = (userId, skillId, type) =>
  client.post(`/users/${userId}/skills`, { skillId, type });

export const removeSkill = (userId, skillId, type) =>
  client.delete(`/users/${userId}/skills/${skillId}`, { params: { type } });

/* Admin panelinde kullaniliyor. */
export const listUsers = () => client.get("/users");

export const deleteUser = (userId) => client.delete(`/users/${userId}`);
