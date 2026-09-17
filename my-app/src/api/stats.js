import client from "./client.js";

export const getStats = () => client.get("/stats");
