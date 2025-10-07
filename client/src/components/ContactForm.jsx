import { useEffect, useState } from "react";
import "../App.css";
import { useAuth } from "../context/AuthContext";

export default function ContactForm({ contact, onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
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

  const validateFirstName = (value) => {
    if (!value) return "Le prénom est obligatoire";
    if (value.length < 2) return "Minimum 2 caractères";
    if (value.length > 50) return "Maximum 50 caractères";
    if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(value))
      return "Caractères invalides (lettres uniquement)";
    return "";
  };

  const validateLastName = (value) => {
    if (!value) return "Le nom est obligatoire";
    if (value.length < 2) return "Minimum 2 caractères";
    if (value.length > 50) return "Maximum 50 caractères";
    if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(value))
      return "Caractères invalides (lettres uniquement)";
    return "";
  };

  const validatePhone = (value) => {
    if (!value) return "Le téléphone est obligatoire";
    const cleanPhone = value.replace(/[\s\-()]/g, "");
    if (cleanPhone.length < 10) return "Minimum 10 chiffres";
    if (cleanPhone.length > 20) return "Maximum 20 chiffres";
    if (!/^[\d\s+\-()]+$/.test(value))
      return "Format invalide (ex: +33 6 12 34 56 78)";
    return "";
  };

  const validateEmail = (value) => {
    if (!value) return ""; // Email optionnel
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Format d'email invalide";
    }
    return "";
  };

  const validateAddress = (value) => {
    if (!value) return ""; // Adresse optionnelle
    if (value.length > 200) return "Maximum 200 caractères";
    return "";
  };

  const handleFieldChange = (field, value, validator) => {
    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "phone":
        setPhone(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "address":
        setAddress(value);
        break;
      default:
        break;
    }

    if (touched[field]) {
      setErrors({ ...errors, [field]: validator(value) });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });

    const validators = {
      firstName: validateFirstName,
      lastName: validateLastName,
      phone: validatePhone,
      email: validateEmail,
      address: validateAddress,
    };

    const values = { firstName, lastName, phone, email, address };
    setErrors({ ...errors, [field]: validators[field](values[field]) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstNameError = validateFirstName(firstName);
    const lastNameError = validateLastName(lastName);
    const phoneError = validatePhone(phone);
    const emailError = validateEmail(email);
    const addressError = validateAddress(address);

    setErrors({
      firstName: firstNameError,
      lastName: lastNameError,
      phone: phoneError,
      email: emailError,
      address: addressError,
    });

    setTouched({
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      address: true,
    });

    if (
      !firstNameError &&
      !lastNameError &&
      !phoneError &&
      !emailError &&
      !addressError
    ) {
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
    }
  };

  return (
    <div className="app-container">
      <div className="card contact-form">
        <h2>{contact ? "✏️ Modifier le contact" : "➕ Ajouter un contact"}</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Prénom * :</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) =>
                handleFieldChange(
                  "firstName",
                  e.target.value,
                  validateFirstName
                )
              }
              onBlur={() => handleBlur("firstName")}
              placeholder="Jean"
              className={
                errors.firstName && touched.firstName ? "input-error" : ""
              }
            />
            {errors.firstName && touched.firstName && (
              <span className="field-error">⚠️ {errors.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <label>Nom * :</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) =>
                handleFieldChange("lastName", e.target.value, validateLastName)
              }
              onBlur={() => handleBlur("lastName")}
              placeholder="Dupont"
              className={
                errors.lastName && touched.lastName ? "input-error" : ""
              }
            />
            {errors.lastName && touched.lastName && (
              <span className="field-error">⚠️ {errors.lastName}</span>
            )}
          </div>

          <div className="form-group">
            <label>Téléphone * :</label>
            <input
              type="text"
              value={phone}
              onChange={(e) =>
                handleFieldChange("phone", e.target.value, validatePhone)
              }
              onBlur={() => handleBlur("phone")}
              placeholder="+33 6 12 34 56 78"
              className={errors.phone && touched.phone ? "input-error" : ""}
            />
            {errors.phone && touched.phone && (
              <span className="field-error">⚠️ {errors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label>Email :</label>
            <input
              type="email"
              value={email}
              onChange={(e) =>
                handleFieldChange("email", e.target.value, validateEmail)
              }
              onBlur={() => handleBlur("email")}
              placeholder="jean.dupont@email.com"
              className={errors.email && touched.email ? "input-error" : ""}
            />
            {errors.email && touched.email && (
              <span className="field-error">⚠️ {errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label>Adresse :</label>
            <textarea
              value={address}
              onChange={(e) =>
                handleFieldChange("address", e.target.value, validateAddress)
              }
              onBlur={() => handleBlur("address")}
              placeholder="123 Rue de la Paix, 75001 Paris"
              className={errors.address && touched.address ? "input-error" : ""}
            />
            {errors.address && touched.address && (
              <span className="field-error">⚠️ {errors.address}</span>
            )}
            <span className="field-hint">{address.length}/200 caractères</span>
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
