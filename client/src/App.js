import { useState } from "react";
import "./App.css";
import ContactList from "./components/ContactList";
import Login from "./components/Login";
import Register from "./components/Register";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return <div className="loading">🔄 Chargement...</div>;
  }

  if (user) {
    return <ContactList />;
  }

  return showRegister ? (
    <Register onSwitchToLogin={() => setShowRegister(false)} />
  ) : (
    <Login onSwitchToRegister={() => setShowRegister(true)} />
  );
}
