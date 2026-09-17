import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";
import "./styles/theme.css";

/**
 * Giris noktasi. Yonlendirme ve saglayicilar App.js'e tasindi; burada
 * yalnizca uygulamanin DOM'a baglanmasi kaldi.
 *
 * StrictMode gelistirme modunda effect'leri bilerek iki kez calistirir.
 * Bu, temizlenmeyen abonelikleri ortaya cikarmak icindir; soket
 * dinleyicilerini useEffect'in donus fonksiyonunda kaldirmamizin sebebi de bu.
 */
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
