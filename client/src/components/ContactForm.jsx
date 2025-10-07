import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

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
    <div>
      <h2>{contact ? "Modifier le contact" : "Ajouter un contact"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Prénom *:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            minLength={2}
          />
        </div>

        <div>
          <label>Nom *:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            minLength={2}
          />
        </div>

        <div>
          <label>Téléphone * (10-20 caractères):</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            pattern="[\d\s+\-()]{10,20}"
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Adresse:</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={200}
          />
        </div>

        <button type="submit">{contact ? "Mettre à jour" : "Créer"}</button>
        <button type="button" onClick={onClose}>
          Annuler
        </button>
      </form>
    </div>
  );
}
