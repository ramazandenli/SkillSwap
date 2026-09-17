import client from "./client.js";

/** { exchanges: [...], teaches: [...] } donuyor; her kayit zaten
 *  "karsi taraf / verdigim yetenek / aldigim yetenek" seklinde normalize edilmis. */
export const getEvents = (userId) => client.get(`/events/user/${userId}`);

/** Teklifi baslatan taraf token'dan geliyor, govdede yok. */
export const createEvent = (payload) => client.post("/events", payload);

export const acceptEvent = (eventId) => client.post(`/events/${eventId}/accept`);

export const rejectEvent = (eventId) => client.delete(`/events/${eventId}`);
