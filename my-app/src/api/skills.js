import client from "./client.js";

export const listSkills = () => client.get("/skills");

/* Katalog degisiklikleri yalnizca yoneticide; sunucu 403 ile koruyor. */
export const createSkill = (name) => client.post("/skills", { name });

export const deleteSkill = (skillId) => client.delete(`/skills/${skillId}`);

/**
 * Arama.
 *
 * "Kimin icin" bilgisi gonderilmiyor: sunucu bunu token'dan okuyor.
 * sort: "points" | "count"
 */
export const searchUsers = ({ skillId, sort }) =>
  client.get("/search", { params: { skillId, sort } });
