import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { ErrorMessage } from "../components/ui/StateMessage.js";
import * as authApi from "../api/auth.js";
import "../styles/auth.css";

const EMPTY_FORM = {
  username: "",
  password: "",
  name: "",
  surname: "",
  gender: "F",
  date: "",
};

function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
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
      // Kullanici adi alinmissa sunucu 409 donuyor; hata mesaji
      // dogrudan formda gosteriliyor.
      const session = await authApi.signup(form);

      login(session);
      navigate(`/home/${session.username}`, { replace: true });
    } catch (signupError) {
      setError(signupError.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card auth-card--wide" onSubmit={handleSubmit}>
        <img src="/logo.png" alt="" className="auth-card__logo" />
        <h1 className="auth-card__title">Hesap olustur</h1>

        <div className="field-row">
          <label className="field">
            <span className="field__label">Ad</span>
            <input className="input" name="name" value={form.name} onChange={updateField} required />
          </label>

          <label className="field">
            <span className="field__label">Soyad</span>
            <input
              className="input"
              name="surname"
              value={form.surname}
              onChange={updateField}
              required
            />
          </label>
        </div>

        <label className="field">
          <span className="field__label">Kullanici adi</span>
          <input
            className="input"
            name="username"
            value={form.username}
            onChange={updateField}
            minLength={6}
            maxLength={30}
            autoComplete="username"
            required
          />
          <span className="field__hint">En az 6 karakter.</span>
        </label>

        <label className="field">
          <span className="field__label">Sifre</span>
          <input
            className="input"
            type="password"
            name="password"
            value={form.password}
            onChange={updateField}
            minLength={8}
            maxLength={30}
            autoComplete="new-password"
            required
          />
          <span className="field__hint">En az 8 karakter.</span>
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field__label">Cinsiyet</span>
            <select className="input" name="gender" value={form.gender} onChange={updateField}>
              <option value="F">Kadin</option>
              <option value="M">Erkek</option>
            </select>
          </label>

          <label className="field">
            <span className="field__label">Dogum tarihi</span>
            <input
              className="input"
              type="date"
              name="date"
              value={form.date}
              onChange={updateField}
              required
            />
          </label>
        </div>

        {error && <ErrorMessage message={error} />}

        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? "Olusturuluyor..." : "Hesabi olustur"}
        </button>

        <p className="auth-card__footer">
          Zaten hesabin var mi? <Link to="/login">Giris yap</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
