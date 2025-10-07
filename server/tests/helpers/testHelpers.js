import Contact from "../../src/models/Contact.js";
import User from "../../src/models/User.js";
import { generateToken } from "../../src/services/authService.js";

/**
 * Crée un utilisateur de test
 */
export const createTestUser = async (userData = {}) => {
  const defaultData = {
    email: "test@example.com",
    password: "Test123",
  };

  const user = new User({ ...defaultData, ...userData });
  await user.save();
  return user;
};

/**
 * Crée un utilisateur de test avec un token
 */
export const createTestUserWithToken = async (userData = {}) => {
  const user = await createTestUser(userData);
  const token = generateToken(user._id);
  return { user, token };
};

/**
 * Crée un contact de test
 */
export const createTestContact = async (userId, contactData = {}) => {
  const defaultData = {
    firstName: "Jean",
    lastName: "Dupont",
    phone: "+33 6 12 34 56 78",
    email: "jean.dupont@example.com",
    address: "123 Rue de la Paix, 75001 Paris",
    userId,
  };

  const contact = new Contact({ ...defaultData, ...contactData });
  await contact.save();
  return contact;
};

/**
 * Crée plusieurs contacts de test
 */
export const createMultipleTestContacts = async (userId, count = 3) => {
  const contacts = [];
  for (let i = 0; i < count; i++) {
    const contact = await createTestContact(userId, {
      firstName: `FirstName${i}`,
      lastName: `LastName${i}`,
      phone: `+33 6 00 00 00 ${i.toString().padStart(2, "0")}`,
      email: `contact${i}@example.com`,
    });
    contacts.push(contact);
  }
  return contacts;
};

/**
 * Données de test communes
 */
export const testData = {
  validUser: {
    email: "valid@example.com",
    password: "ValidPass123",
  },
  invalidUser: {
    email: "invalid-email",
    password: "123",
  },
  validContact: {
    firstName: "Pierre",
    lastName: "Martin",
    phone: "+33 6 98 76 54 32",
    email: "pierre.martin@example.com",
    address: "456 Avenue des Champs, 75008 Paris",
  },
  invalidContact: {
    firstName: "A", // Trop court
    lastName: "B", // Trop court
    phone: "123", // Trop court
    email: "invalid-email",
  },
};
