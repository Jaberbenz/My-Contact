import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function ContactForm({ contact, onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const { createContact, updateContact, error } = useAuth();

  useEffect(() => {
    if (contact) {
      setFirstName(contact.firstName);
      setLastName(contact.lastName);
      setPhone(contact.phone);
      setEmail(contact.email || "");
      setAddress(contact.address || "");
    }
  }, [contact]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const contactData = { firstName, lastName, phone, email, address };

    let result;
    if (contact) {
      result = await updateContact(contact._id, contactData);
    } else {
      result = await createContact(contactData);
    }

    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="app-container">
      <div className="card contact-form">
        <h2>{contact ? "✏️ Modifier le contact" : "➕ Ajouter un contact"}</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Prénom * :</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              minLength={2}
              placeholder="Jean"
            />
          </div>

          <div className="form-group">
            <label>Nom * :</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              minLength={2}
              placeholder="Dupont"
            />
          </div>

          <div className="form-group">
            <label>Téléphone * :</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              pattern="[\d\s+\-()]{10,20}"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div className="form-group">
            <label>Email :</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean.dupont@email.com"
            />
          </div>

          <div className="form-group">
            <label>Adresse :</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={200}
              placeholder="123 Rue de la Paix, 75001 Paris"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {contact ? "Mettre à jour" : "Créer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
