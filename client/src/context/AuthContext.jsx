import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../api/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger le profil au démarrage si token existe
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      loadContacts();
    }
    setLoading(false);
  }, []);

  // ========== AUTH ==========
  const register = async (email, password) => {
    console.log("📝 [CONTEXT] Register appelé pour:", email);
    try {
      setError(null);
      const response = await apiClient.post("/auth/register", {
        email,
        password,
      });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setToken(token);
      setUser(user);

      return { success: true };
    } catch (err) {
      const message = err.message || "Erreur lors de l'inscription";
      setError(message);
      return { success: false, error: message };
    }
  };

  const login = async (email, password) => {
    console.log("📝 [CONTEXT] Login appelé pour:", email);
    try {
      setError(null);
      const response = await apiClient.post("/auth/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setToken(token);
      setUser(user);

      await loadContacts();
      return { success: true };
    } catch (err) {
      const message = err.message || "Erreur lors de la connexion";
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setContacts([]);
    setError(null);
  };

  // ========== CONTACTS ==========
  const loadContacts = async () => {
    try {
      setError(null);
      const response = await apiClient.get("/contacts");
      setContacts(response.data.contacts);
    } catch (err) {
      const message = err.message || "Erreur lors du chargement des contacts";
      setError(message);
    }
  };

  const createContact = async (contactData) => {
    try {
      setError(null);
      const response = await apiClient.post("/contacts", contactData);
      setContacts([...contacts, response.data.contact]);
      return { success: true };
    } catch (err) {
      const message = err.message || "Erreur lors de la création";
      setError(message);
      return { success: false, error: message };
    }
  };

  const updateContact = async (id, contactData) => {
    try {
      setError(null);
      const response = await apiClient.patch(`/contacts/${id}`, contactData);
      setContacts(
        contacts.map((c) => (c._id === id ? response.data.contact : c))
      );
      return { success: true };
    } catch (err) {
      const message = err.message || "Erreur lors de la mise à jour";
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteContact = async (id) => {
    try {
      setError(null);
      await apiClient.delete(`/contacts/${id}`);
      setContacts(contacts.filter((c) => c._id !== id));
      return { success: true };
    } catch (err) {
      const message = err.message || "Erreur lors de la suppression";
      setError(message);
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        contacts,
        loading,
        error,
        register,
        login,
        logout,
        loadContacts,
        createContact,
        updateContact,
        deleteContact,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
