import { useState } from "react";
import "../App.css";
import { useAuth } from "../context/AuthContext";

export default function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>🔐 Connexion</h1>
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
            <label>Mot de passe :</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Votre mot de passe"
            />
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
