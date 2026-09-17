import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import Landing from "./pages/Landing.js";
import Login from "./pages/Login.js";
import Signup from "./pages/Signup.js";
import Home from "./pages/Home.js";
import Messages from "./pages/Messages.js";
import Admin from "./pages/Admin.js";

/**
 * Uygulamanin koku: saglayicilar + yonlendirme tablosu.
 *
 * Eskiden bu tablo index.js icinde createBrowserRouter ile kuruluyordu ve
 * bilinmeyen adresler errorElement olarak Login'e dusuyordu -- yani "sayfa
 * yok" ile "giris gerekiyor" ayni sey sayiliyordu. Simdi bilinmeyen adres
 * acikca ana sayfaya yonlendiriliyor.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/home/:username"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Ayni sayfa iki adresle: kisi secili veya secilmemis hali. */}
          <Route
            path="/messages/:username"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:username/:user"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
