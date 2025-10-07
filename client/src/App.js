import { useState } from "react";
import ContactList from "./components/ContactList";
import Login from "./components/Login";
import Register from "./components/Register";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return <div>Chargement...</div>;
  }

  // Si utilisateur connecté, afficher les contacts
  if (user) {
    return <ContactList />;
  }

  // Sinon, afficher login ou register
  return showRegister ? (
    <Register onSwitchToLogin={() => setShowRegister(false)} />
  ) : (
    <Login onSwitchToRegister={() => setShowRegister(true)} />
  );
}
