import express from "express";
import request from "supertest";
import contactRoutes from "../../../src/routes/contact.js";
import {
  createMultipleTestContacts,
  createTestContact,
  createTestUserWithToken,
} from "../../helpers/testHelpers.js";
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
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/contacts", contactRoutes);
  return app;
};

describe("Contact Routes - Tests d'intégration", () => {
  let app;
  let userToken;
  let userId;

  beforeAll(async () => {
    await setupDB();
    app = createTestApp();
  });

  afterAll(async () => {
    await teardownDB();
  });

  beforeEach(async () => {
    const { user, token } = await createTestUserWithToken({
      email: "contactowner@example.com",
    });
    userToken = token;
    userId = user._id;
  });

  afterEach(async () => {
    await clearDB();
  });

  describe("POST /contacts", () => {
    it("devrait créer un nouveau contact avec des données valides", async () => {
      const contactData = {
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        email: "jean.dupont@example.com",
        address: "123 Rue de la Paix, 75001 Paris",
      };

      const response = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${userToken}`)
        .send(contactData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Contact créé avec succès");
      expect(response.body.data.contact).toBeDefined();
      expect(response.body.data.contact.firstName).toBe(contactData.firstName);
      expect(response.body.data.contact.lastName).toBe(contactData.lastName);
      expect(response.body.data.contact.phone).toBe(contactData.phone);
    });

    it("devrait créer un contact sans champs optionnels", async () => {
      const contactData = {
        firstName: "Marie",
        lastName: "Martin",
        phone: "+33 6 98 76 54 32",
      };

      const response = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${userToken}`)
        .send(contactData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contact.firstName).toBe(contactData.firstName);
    });

    it("devrait rejeter un contact sans token", async () => {
      const contactData = {
        firstName: "Test",
        lastName: "User",
        phone: "+33 6 12 34 56 78",
      };

      const response = await request(app)
        .post("/contacts")
        .send(contactData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("devrait rejeter des données invalides", async () => {
      const contactData = {
        firstName: "J", // Trop court
        lastName: "D", // Trop court
        phone: "123", // Trop court
      };

      const response = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${userToken}`)
        .send(contactData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Données invalides");
    });

    it("devrait rejeter un contact sans firstName", async () => {
      const response = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          lastName: "Dupont",
          phone: "+33 6 12 34 56 78",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /contacts", () => {
    it("devrait retourner tous les contacts de l'utilisateur", async () => {
      await createMultipleTestContacts(userId, 3);

      const response = await request(app)
        .get("/contacts")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contacts).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.total).toBe(3);
    });

    it("devrait retourner un tableau vide si aucun contact", async () => {
      const response = await request(app)
        .get("/contacts")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contacts).toHaveLength(0);
    });

    it("devrait supporter la recherche par nom", async () => {
      await createTestContact(userId, {
        firstName: "Jean",
        lastName: "Dupont",
      });
      await createTestContact(userId, {
        firstName: "Marie",
        lastName: "Martin",
      });

      const response = await request(app)
        .get("/contacts?search=Jean")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contacts.length).toBeGreaterThan(0);
      expect(response.body.data.contacts[0].firstName.toLowerCase()).toContain(
        "jean"
      );
    });

    it("devrait supporter le tri", async () => {
      await createTestContact(userId, { lastName: "Zebra" });
      await createTestContact(userId, { lastName: "Alpha" });

      const response = await request(app)
        .get("/contacts?sort=lastName&order=asc")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.contacts[0].lastName).toBe("Alpha");
      expect(response.body.data.contacts[1].lastName).toBe("Zebra");
    });

    it("devrait supporter la pagination", async () => {
      await createMultipleTestContacts(userId, 5);

      const response = await request(app)
        .get("/contacts?page=1&limit=2")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.contacts).toHaveLength(2);
      expect(response.body.data.pagination.total).toBe(5);
      expect(response.body.data.pagination.pages).toBe(3);
    });

    it("devrait rejeter une requête sans token", async () => {
      const response = await request(app).get("/contacts").expect(401);

      expect(response.body.success).toBe(false);
    });

    it("ne devrait retourner que les contacts de l'utilisateur connecté", async () => {
      // Créer un autre utilisateur
      const { user: otherUser, token: otherToken } =
        await createTestUserWithToken({
          email: "otheruser@example.com",
        });

      // Créer des contacts pour chaque utilisateur
      await createTestContact(userId, { firstName: "MyContact" });
      await createTestContact(otherUser._id, { firstName: "OtherContact" });

      const response = await request(app)
        .get("/contacts")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.contacts).toHaveLength(1);
      expect(response.body.data.contacts[0].firstName).toBe("MyContact");
    });
  });

  describe("GET /contacts/:id", () => {
    it("devrait retourner un contact spécifique", async () => {
      const contact = await createTestContact(userId, {
        firstName: "Specific",
        lastName: "Contact",
      });

      const response = await request(app)
        .get(`/contacts/${contact._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contact.firstName).toBe("Specific");
      expect(response.body.data.contact._id).toBe(contact._id.toString());
    });

    it("devrait retourner 404 pour un contact inexistant", async () => {
      const response = await request(app)
        .get("/contacts/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Contact introuvable");
    });

    it("ne devrait pas retourner le contact d'un autre utilisateur", async () => {
      const { user: otherUser } = await createTestUserWithToken({
        email: "other@example.com",
      });

      const otherContact = await createTestContact(otherUser._id);

      const response = await request(app)
        .get(`/contacts/${otherContact._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PATCH /contacts/:id", () => {
    it("devrait mettre à jour un contact", async () => {
      const contact = await createTestContact(userId);

      const updateData = {
        firstName: "Updated",
        lastName: "Name",
      };

      const response = await request(app)
        .patch(`/contacts/${contact._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contact.firstName).toBe("Updated");
      expect(response.body.data.contact.lastName).toBe("Name");
    });

    it("devrait mettre à jour partiellement un contact", async () => {
      const contact = await createTestContact(userId, {
        firstName: "Original",
        lastName: "Name",
      });

      const response = await request(app)
        .patch(`/contacts/${contact._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ firstName: "Modified" })
        .expect(200);

      expect(response.body.data.contact.firstName).toBe("Modified");
      expect(response.body.data.contact.lastName).toBe("Name");
    });

    it("devrait rejeter des données invalides", async () => {
      const contact = await createTestContact(userId);

      const response = await request(app)
        .patch(`/contacts/${contact._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          firstName: "A", // Trop court
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("devrait retourner 404 pour un contact inexistant", async () => {
      const response = await request(app)
        .patch("/contacts/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ firstName: "Test" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it("ne devrait pas mettre à jour le contact d'un autre utilisateur", async () => {
      const { user: otherUser } = await createTestUserWithToken({
        email: "other@example.com",
      });

      const otherContact = await createTestContact(otherUser._id);

      const response = await request(app)
        .patch(`/contacts/${otherContact._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ firstName: "Hacked" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /contacts/:id", () => {
    it("devrait supprimer un contact", async () => {
      const contact = await createTestContact(userId);

      const response = await request(app)
        .delete(`/contacts/${contact._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Contact supprimé avec succès");

      // Vérifier que le contact a bien été supprimé
      const getResponse = await request(app)
        .get(`/contacts/${contact._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);
    });

    it("devrait retourner 404 pour un contact inexistant", async () => {
      const response = await request(app)
        .delete("/contacts/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it("ne devrait pas supprimer le contact d'un autre utilisateur", async () => {
      const { user: otherUser } = await createTestUserWithToken({
        email: "other@example.com",
      });

      const otherContact = await createTestContact(otherUser._id);

      const response = await request(app)
        .delete(`/contacts/${otherContact._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /contacts", () => {
    it("devrait supprimer tous les contacts de l'utilisateur", async () => {
      await createMultipleTestContacts(userId, 3);

      const response = await request(app)
        .delete("/contacts")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedCount).toBe(3);

      // Vérifier qu'il n'y a plus de contacts
      const getResponse = await request(app)
        .get("/contacts")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(getResponse.body.data.contacts).toHaveLength(0);
    });

    it("ne devrait pas supprimer les contacts des autres utilisateurs", async () => {
      const { user: otherUser } = await createTestUserWithToken({
        email: "other@example.com",
      });

      await createMultipleTestContacts(userId, 2);
      await createMultipleTestContacts(otherUser._id, 3);

      const response = await request(app)
        .delete("/contacts")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.deletedCount).toBe(2);
    });
  });
});
