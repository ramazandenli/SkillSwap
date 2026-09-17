import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

/**
 * Tarayici, farkli porttaki API'ye istek atarken CORS kontrolu yapiyor.
 * Eskiden cors() parametresiz cagriliyordu, yani her kaynaga izin veriliyordu.
 * Simdi sadece kendi istemcimize aciyoruz.
 *
 * credentials: true olmadan tarayici cerezi cross-origin isteklere eklemez.
 * Bu ayar acikken origin'in kesin bir adres olmasi zorunlu — "*" ile birlikte
 * kullanilamaz. Zaten tek bir adrese aciyoruz.
 */
app.use(cors({ origin: env.clientOrigin, credentials: true }));

// JSON govdeleri okumak icin. body-parser'in urlencoded'ina ihtiyac kalmadi:
// istemci her istegi JSON olarak gonderiyor ve express bunu kendi icinde tasiyor.
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", routes);

// Sirasi onemli: once "eslesen rota yok", en sonda hata yakalayici.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
