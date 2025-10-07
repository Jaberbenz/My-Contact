import { useState } from "react";
import "../App.css";
import { useAuth } from "../context/AuthContext";

export default function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { login, error } = useAuth();

  const validateEmail = (value) => {
    if (!value) return "L'email est obligatoire";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Format d'email invalide";
    }
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Le mot de passe est obligatoire";
    if (value.length < 6)
      return "Le mot de passe doit contenir au moins 6 caractères";
    return "";
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      setErrors({ ...errors, email: validateEmail(value) });
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setErrors({ ...errors, password: validatePassword(value) });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    if (field === "email") {
      setErrors({ ...errors, email: validateEmail(email) });
    } else if (field === "password") {
      setErrors({ ...errors, password: validatePassword(password) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valider tous les champs
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    setTouched({ email: true, password: true });

    // Si pas d'erreurs, soumettre
    if (!emailError && !passwordError) {
      await login(email, password);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1> Connexion</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Email :</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur("email")}
              placeholder="votre@email.com"
              className={errors.email && touched.email ? "input-error" : ""}
            />
            {errors.email && touched.email && (
              <span className="field-error"> {errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label>Mot de passe :</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur("password")}
              placeholder="Votre mot de passe"
              className={
                errors.password && touched.password ? "input-error" : ""
              }
            />
            {errors.password && touched.password && (
              <span className="field-error">⚠️ {errors.password}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary">
            Se connecter
          </button>
        </form>

        <p className="text-center mt-20">
          Pas de compte ?
          <button onClick={onSwitchToRegister} className="link">
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
}
