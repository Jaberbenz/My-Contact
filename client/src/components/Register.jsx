import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(email, password);
    if (result.success) {
      // Inscription réussie, l'utilisateur est maintenant connecté
      alert("Compte créé avec succès !");
    }
  };

  return (
    <div>
      <h1>Inscription</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Mot de passe (min 6 caractères):</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button type="submit">Créer un compte</button>
      </form>

      <p>
        Déjà un compte ?<button onClick={onSwitchToLogin}>Se connecter</button>
      </p>
    </div>
  );
}
