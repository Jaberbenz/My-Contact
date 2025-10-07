import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ContactForm from "./ContactForm";
import "../App.css";

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
      <div className="app-header">
        <h1>📇 Mes Contacts</h1>
        <div className="user-info">
          <span className="user-email">👤 {user?.email}</span>
          <button onClick={logout} className="btn btn-secondary btn-small">
            Déconnexion
          </button>
        </div>
      </div>

      <div className="contacts-container">
        {!showForm ? (
          <div>
            <div className="contacts-header">
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary btn-small"
              >
                ➕ Ajouter un contact
              </button>
              <span className="contacts-count">
                {contacts.length} contact{contacts.length > 1 ? "s" : ""}
              </span>
            </div>

            {contacts.length === 0 ? (
              <div className="empty-state">
                <h3>📭 Aucun contact</h3>
                <p>Commencez par ajouter votre premier contact !</p>
              </div>
            ) : (
              <div>
                {contacts.map((contact) => (
                  <div key={contact._id} className="contact-item">
                    <div className="contact-name">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="contact-details">
                      📞 {contact.phone}
                      {contact.email && (
                        <>
                          <br />
                          📧 {contact.email}
                        </>
                      )}
                      {contact.address && (
                        <>
                          <br />
                          📍 {contact.address}
                        </>
                      )}
                    </div>
                    <div className="contact-actions">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="btn btn-success btn-small"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(contact._id)}
                        className="btn btn-danger btn-small"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <ContactForm contact={editingContact} onClose={handleCloseForm} />
        )}
      </div>
    </div>
  );
}
