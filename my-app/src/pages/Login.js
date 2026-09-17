import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { ErrorMessage } from "../components/ui/StateMessage.js";
import * as authApi from "../api/auth.js";
import "../styles/auth.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Sunucu artik { message, auth, type } yerine dogrudan
      // { username, type } donuyor; basarisiz giris ise 401 ile geliyor ve
      // axios katmani onu Error'a ceviriyor. Yani "auth" bayragini elle
      // kontrol etmek gerekmiyor.
      const session = await authApi.login(form);

      login(session);
      // replace: true -> geri tusu kullaniciyi giris formuna geri atmaz.
      navigate(session.type === "admin" ? "/admin" : `/home/${session.username}`, {
        replace: true,
      });
    } catch (loginError) {
      setError(loginError.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <img src="/logo.png" alt="" className="auth-card__logo" />
        <h1 className="auth-card__title">Giris yap</h1>

        <label className="field">
          <span className="field__label">Kullanici adi</span>
          <input
            className="input"
            name="username"
            value={form.username}
            onChange={updateField}
            autoComplete="username"
            required
          />
        </label>

        <label className="field">
          <span className="field__label">Sifre</span>
          <input
            className="input"
            type="password"
            name="password"
            value={form.password}
            onChange={updateField}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <ErrorMessage message={error} />}

        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? "Giris yapiliyor..." : "Giris yap"}
        </button>

        <p className="auth-card__footer">
          Hesabin yok mu? <Link to="/signup">Kayit ol</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
