import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ContactForm from "./ContactForm";

export default function ContactList() {
  const { user, contacts, logout, deleteContact } = useAuth();
  const [editingContact, setEditingContact] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce contact ?")) {
      await deleteContact(id);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  return (
    <div>
      <h1>Mes Contacts</h1>
      <p>Connecté en tant que: {user?.email}</p>
      <button onClick={logout}>Déconnexion</button>

      <hr />

      {!showForm ? (
        <div>
          <button onClick={() => setShowForm(true)}>Ajouter un contact</button>

          <h2>Liste des contacts ({contacts.length})</h2>

          {contacts.length === 0 ? (
            <p>Aucun contact pour le moment</p>
          ) : (
            <ul>
              {contacts.map((contact) => (
                <li key={contact._id}>
                  <strong>
                    {contact.firstName} {contact.lastName}
                  </strong>
                  <br />
                  Téléphone: {contact.phone}
                  {contact.email && (
                    <>
                      <br />
                      Email: {contact.email}
                    </>
                  )}
                  {contact.address && (
                    <>
                      <br />
                      Adresse: {contact.address}
                    </>
                  )}
                  <br />
                  <button onClick={() => handleEdit(contact)}>Modifier</button>
                  <button onClick={() => handleDelete(contact._id)}>
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <ContactForm contact={editingContact} onClose={handleCloseForm} />
      )}
    </div>
  );
}
