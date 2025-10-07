import Contact from "../../../src/models/Contact.js";
import { createTestUser } from "../../helpers/testHelpers.js";
import { clearDB, setupDB, teardownDB } from "../../setup.js";
import {
  jest,
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";

describe("Contact Model - Tests Unitaires", () => {
  let testUser;

  beforeAll(async () => {
    await setupDB();
  });

  afterAll(async () => {
    await teardownDB();
  });

  beforeEach(async () => {
    testUser = await createTestUser({ email: "contactuser@example.com" });
  });

  afterEach(async () => {
    await clearDB();
  });

  describe("Validation des champs", () => {
    it("devrait créer et sauvegarder un contact valide", async () => {
      const contactData = {
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        email: "jean.dupont@example.com",
        address: "123 Rue de la Paix, 75001 Paris",
        userId: testUser._id,
      };

      const contact = new Contact(contactData);
      const savedContact = await contact.save();

      expect(savedContact._id).toBeDefined();
      expect(savedContact.firstName).toBe(contactData.firstName);
      expect(savedContact.lastName).toBe(contactData.lastName);
      expect(savedContact.phone).toBe(contactData.phone);
      expect(savedContact.email).toBe(contactData.email);
      expect(savedContact.address).toBe(contactData.address);
      expect(savedContact.userId.toString()).toBe(testUser._id.toString());
    });

    it("devrait créer un contact sans champs optionnels", async () => {
      const contactData = {
        firstName: "Marie",
        lastName: "Martin",
        phone: "+33 6 98 76 54 32",
        userId: testUser._id,
      };

      const contact = new Contact(contactData);
      const savedContact = await contact.save();

      expect(savedContact._id).toBeDefined();
      expect(savedContact.email).toBeUndefined();
      expect(savedContact.address).toBeUndefined();
    });

    it("devrait rejeter un contact sans firstName", async () => {
      const contact = new Contact({
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        userId: testUser._id,
      });

      await expect(contact.save()).rejects.toThrow();
    });

    it("devrait rejeter un contact sans lastName", async () => {
      const contact = new Contact({
        firstName: "Jean",
        phone: "+33 6 12 34 56 78",
        userId: testUser._id,
      });

      await expect(contact.save()).rejects.toThrow();
    });

    it("devrait rejeter un contact sans phone", async () => {
      const contact = new Contact({
        firstName: "Jean",
        lastName: "Dupont",
        userId: testUser._id,
      });

      await expect(contact.save()).rejects.toThrow();
    });

    it("devrait rejeter un contact sans userId", async () => {
      const contact = new Contact({
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
      });

      await expect(contact.save()).rejects.toThrow();
    });

    it("devrait rejeter un firstName trop court", async () => {
      const contact = new Contact({
        firstName: "J",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        userId: testUser._id,
      });

      await expect(contact.save()).rejects.toThrow();
    });

    it("devrait rejeter un firstName trop long", async () => {
      const contact = new Contact({
        firstName: "A".repeat(51),
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        userId: testUser._id,
      });

      await expect(contact.save()).rejects.toThrow();
    });

    it("devrait rejeter un lastName trop court", async () => {
      const contact = new Contact({
        firstName: "Jean",
        lastName: "D",
        phone: "+33 6 12 34 56 78",
        userId: testUser._id,
      });

      await expect(contact.save()).rejects.toThrow();
    });

    it("devrait rejeter un lastName trop long", async () => {
      const contact = new Contact({
        firstName: "Jean",
        lastName: "B".repeat(51),
        phone: "+33 6 12 34 56 78",
        userId: testUser._id,
      });

      await expect(contact.save()).rejects.toThrow();
    });

    it("devrait rejeter un phone trop court", async () => {
      const contact = new Contact({
        firstName: "Jean",
        lastName: "Dupont",
        phone: "123",
        userId: testUser._id,
      });

      await expect(contact.save()).rejects.toThrow();
    });

    it("devrait rejeter un phone trop long", async () => {
      const contact = new Contact({
        firstName: "Jean",
        lastName: "Dupont",
        phone: "1".repeat(21),
        userId: testUser._id,
      });

      await expect(contact.save()).rejects.toThrow();
    });

    it("devrait rejeter un email invalide", async () => {
      const contact = new Contact({
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        email: "invalid-email",
        userId: testUser._id,
      });

      await expect(contact.save()).rejects.toThrow();
    });

    it("devrait accepter différents formats de téléphone", async () => {
      const phoneFormats = [
        "+33 6 12 34 56 78",
        "0612345678",
        "+1 (555) 123-4567",
        "06 12 34 56 78",
        "+33612345678",
      ];

      for (const phone of phoneFormats) {
        const contact = new Contact({
          firstName: "Test",
          lastName: "User",
          phone,
          userId: testUser._id,
        });

        const saved = await contact.save();
        expect(saved._id).toBeDefined();
      }
    });

    it("devrait rejeter une address trop longue", async () => {
      const contact = new Contact({
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        address: "A".repeat(201),
        userId: testUser._id,
      });

      await expect(contact.save()).rejects.toThrow();
    });
  });

  describe("Trim des champs", () => {
    it("devrait trim les espaces du firstName", async () => {
      const contact = new Contact({
        firstName: "  Jean  ",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        userId: testUser._id,
      });

      const saved = await contact.save();
      expect(saved.firstName).toBe("Jean");
    });

    it("devrait trim les espaces du lastName", async () => {
      const contact = new Contact({
        firstName: "Jean",
        lastName: "  Dupont  ",
        phone: "+33 6 12 34 56 78",
        userId: testUser._id,
      });

      const saved = await contact.save();
      expect(saved.lastName).toBe("Dupont");
    });

    it("devrait normaliser l'email en minuscules", async () => {
      const contact = new Contact({
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        email: "JEAN.DUPONT@EXAMPLE.COM",
        userId: testUser._id,
      });

      const saved = await contact.save();
      expect(saved.email).toBe("jean.dupont@example.com");
    });
  });

  describe("Méthodes du modèle", () => {
    it("getFullName devrait retourner le nom complet", async () => {
      const contact = new Contact({
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        userId: testUser._id,
      });

      await contact.save();
      expect(contact.getFullName()).toBe("Jean Dupont");
    });

    it("fullName virtual devrait retourner le nom complet", async () => {
      const contact = new Contact({
        firstName: "Marie",
        lastName: "Martin",
        phone: "+33 6 98 76 54 32",
        userId: testUser._id,
      });

      await contact.save();
      expect(contact.fullName).toBe("Marie Martin");
    });

    it("toJSON devrait inclure les virtuels", async () => {
      const contact = new Contact({
        firstName: "Pierre",
        lastName: "Bernard",
        phone: "+33 6 11 22 33 44",
        userId: testUser._id,
      });

      await contact.save();
      const json = contact.toJSON();

      expect(json.fullName).toBe("Pierre Bernard");
    });
  });

  describe("Timestamps", () => {
    it("devrait ajouter automatiquement createdAt et updatedAt", async () => {
      const contact = new Contact({
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        userId: testUser._id,
      });

      const saved = await contact.save();

      expect(saved.createdAt).toBeDefined();
      expect(saved.updatedAt).toBeDefined();
      expect(saved.createdAt).toBeInstanceOf(Date);
      expect(saved.updatedAt).toBeInstanceOf(Date);
    });

    it("devrait mettre à jour updatedAt lors de la modification", async () => {
      const contact = new Contact({
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        userId: testUser._id,
      });

      await contact.save();
      const originalUpdatedAt = contact.updatedAt;

      // Attendre un peu
      await new Promise((resolve) => setTimeout(resolve, 100));

      contact.firstName = "Paul";
      await contact.save();

      expect(contact.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("Index et performances", () => {
    it("devrait permettre plusieurs contacts pour le même utilisateur", async () => {
      const contact1 = new Contact({
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        userId: testUser._id,
      });

      const contact2 = new Contact({
        firstName: "Marie",
        lastName: "Martin",
        phone: "+33 6 98 76 54 32",
        userId: testUser._id,
      });

      await contact1.save();
      await contact2.save();

      const contacts = await Contact.find({ userId: testUser._id });
      expect(contacts).toHaveLength(2);
    });

    it("devrait permettre le même nom pour différents utilisateurs", async () => {
      const user2 = await createTestUser({ email: "user2@example.com" });

      const contact1 = new Contact({
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        userId: testUser._id,
      });

      const contact2 = new Contact({
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33 6 98 76 54 32",
        userId: user2._id,
      });

      await contact1.save();
      await contact2.save();

      expect(contact1._id).not.toBe(contact2._id);
    });
  });
});
