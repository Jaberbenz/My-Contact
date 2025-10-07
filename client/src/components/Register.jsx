import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function Register({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(email, password);
    if (result.success) {
      alert("Compte créé avec succès !");
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>📝 Inscription</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email :</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
            />
          </div>

          <div className="form-group">
            <label>Mot de passe (min 6 caractères) :</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Votre mot de passe"
            />
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
