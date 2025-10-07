import { useState } from "react";
import "../App.css";
import { useAuth } from "../context/AuthContext";

export default function Register({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { register, error } = useAuth();

  const validateEmail = (value) => {
    if (!value) return "L'email est obligatoire";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Format d'email invalide (ex: nom@domaine.com)";
    }
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Le mot de passe est obligatoire";
    if (value.length < 6) return "Minimum 6 caractères requis";
    if (!/[A-Z]/.test(value)) return "Doit contenir au moins 1 majuscule";
    if (!/[a-z]/.test(value)) return "Doit contenir au moins 1 minuscule";
    if (!/[0-9]/.test(value)) return "Doit contenir au moins 1 chiffre";
    return "";
  };

  const validateConfirmPassword = (value) => {
    if (!value) return "Veuillez confirmer le mot de passe";
    if (value !== password) return "Les mots de passe ne correspondent pas";
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
      setErrors({
        ...errors,
        password: validatePassword(value),
        confirmPassword: confirmPassword
          ? validateConfirmPassword(confirmPassword)
          : "",
      });
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      setErrors({ ...errors, confirmPassword: validateConfirmPassword(value) });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    if (field === "email") {
      setErrors({ ...errors, email: validateEmail(email) });
    } else if (field === "password") {
      setErrors({ ...errors, password: validatePassword(password) });
    } else if (field === "confirmPassword") {
      setErrors({
        ...errors,
        confirmPassword: validateConfirmPassword(confirmPassword),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    setErrors({
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    setTouched({ email: true, password: true, confirmPassword: true });

    if (!emailError && !passwordError && !confirmPasswordError) {
      const result = await register(email, password);
      if (result.success) {
        alert("✅ Compte créé avec succès !");
      }
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "", width: "0%" };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2)
      return { label: "Faible", color: "#f56565", width: "33%" };
    if (strength <= 4)
      return { label: "Moyen", color: "#ed8936", width: "66%" };
    return { label: "Fort", color: "#48bb78", width: "100%" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="app-container">
      <div className="card">
        <h1> Inscription</h1>
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
            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: passwordStrength.width,
                      backgroundColor: passwordStrength.color,
                    }}
                  ></div>
                </div>
                <span
                  style={{
                    color: passwordStrength.color,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  Force: {passwordStrength.label}
                </span>
              </div>
            )}
            {errors.password && touched.password && (
              <span className="field-error"> {errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe :</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="Confirmez votre mot de passe"
              className={
                errors.confirmPassword && touched.confirmPassword
                  ? "input-error"
                  : ""
              }
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <span className="field-error"> {errors.confirmPassword}</span>
            )}
            {confirmPassword &&
              !errors.confirmPassword &&
              touched.confirmPassword && (
                <span className="field-success">
                  ✅ Les mots de passe correspondent
                </span>
              )}
          </div>

          <button type="submit" className="btn btn-primary">
            Créer un compte
          </button>
        </form>

        <p className="text-center mt-20">
          Déjà un compte ?
          <button onClick={onSwitchToLogin} className="link">
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
