import dotenv from "dotenv";

/**
 * .env dosyasi tek bir yerde, en erken noktada okunuyor.
 *
 * Neden ayri bir modul: ES modullerinde import'lar, dosyanin govdesinden once
 * calisir. dotenv.config() cagrisini server.js'in govdesine koysaydik, o satir
 * calismadan once db.js coktan yuklenmis ve process.env.DB_USER'i bos okumus
 * olurdu. Env'i import zincirinin en dibindeki bu modulde yukleyerek, onu
 * import eden herkesin degerleri hazir bulmasini garantiliyoruz.
 */
dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`.env icinde ${name} tanimli degil. .env.example dosyasina bakin.`);
  }
  return value;
}

/**
 * "7d", "12h", "30m", "45s" gibi sureleri milisaniyeye cevirir.
 *
 * Neden gerekli: ayni sure iki yerde kullaniliyor — JWT'nin kendi `expiresIn`
 * alani (metin bekliyor) ve cerezin `maxAge` alani (milisaniye bekliyor).
 * Ikisini elle iki ayri yerde tutmak, birini degistirip digerini unutmaya
 * acik olurdu; tek kaynaktan turetiyoruz.
 */
function toMilliseconds(duration) {
  const match = /^(\d+)([dhms])$/.exec(duration);

  if (!match) {
    throw new Error(`JWT_EXPIRES_IN degeri gecersiz: ${duration} (ornek: 7d, 12h, 30m)`);
  }

  const amount = Number(match[1]);
  const unit = { d: 86400, h: 3600, m: 60, s: 1 }[match[2]];

  return amount * unit * 1000;
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

export const env = {
  port: Number(process.env.PORT) || 4000,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  // Cerezin `secure` bayragi buna bagli: gelistirmede http://localhost
  // kullanildigi icin acik olamaz, uretimde acik olmali.
  isProduction: process.env.NODE_ENV === "production",
  jwt: {
    // Varsayilan deger bilerek yok: gizli anahtari koda gomulu bir varsayilana
    // birakmak, .env unutuldugunda herkesin bildigi bir anahtarla token
    // imzalamak demektir. Eksikse sunucu hic acilmasin.
    secret: required("JWT_SECRET"),
    expiresIn: jwtExpiresIn,
    maxAgeMs: toMilliseconds(jwtExpiresIn),
  },
  database: {
    user: required("DB_USER"),
    host: required("DB_HOST"),
    database: required("DB_DATABASE"),
    password: required("DB_PASSWORD"),
    port: Number(process.env.DB_PORT) || 5432,
  },
};
