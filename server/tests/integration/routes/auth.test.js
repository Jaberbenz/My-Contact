import express from "express";
import request from "supertest";
import authRoutes from "../../../src/routes/auth.js";
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
// Créer une application Express de test
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRoutes);
  return app;
};

describe("Auth Routes - Tests d'intégration", () => {
  let app;

  beforeAll(async () => {
    await setupDB();
    app = createTestApp();
  });

  afterAll(async () => {
    await teardownDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  describe("POST /auth/register", () => {
    it("devrait créer un nouvel utilisateur avec des données valides", async () => {
      const userData = {
        email: "newuser@example.com",
        password: "Password123",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Utilisateur créé avec succès");
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("devrait rejeter un email déjà utilisé", async () => {
      const userData = {
        email: "duplicate@example.com",
        password: "Password123",
      };

      // Créer le premier utilisateur
      await createTestUser(userData);

      // Essayer de créer un doublon
      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Cet email est déjà utilisé");
    });

    it("devrait rejeter un email invalide", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "invalid-email",
          password: "Password123",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Données invalides");
      expect(response.body.errors).toBeDefined();
    });

    it("devrait rejeter un mot de passe trop court", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "123",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Données invalides");
    });

    it("devrait rejeter des données manquantes", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /auth/login", () => {
    it("devrait connecter un utilisateur avec des identifiants valides", async () => {
      const userData = {
        email: "login@example.com",
        password: "LoginPass123",
      };

      await createTestUser(userData);

      const response = await request(app)
        .post("/auth/login")
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Connexion réussie");
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("devrait rejeter un email inexistant", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "Password123",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Email ou mot de passe");
    });

    it("devrait rejeter un mot de passe incorrect", async () => {
      const userData = {
        email: "wrongpass@example.com",
        password: "CorrectPass123",
      };

      await createTestUser(userData);

      const response = await request(app)
        .post("/auth/login")
        .send({
          email: userData.email,
          password: "WrongPassword",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("devrait rejeter des données invalides", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "invalid-email",
          password: "123",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Données invalides");
    });

    it("devrait être sensible à la casse pour le mot de passe", async () => {
      const userData = {
        email: "casetest@example.com",
        password: "CaseSensitive123",
      };

      await createTestUser(userData);

      const response = await request(app)
        .post("/auth/login")
        .send({
          email: userData.email,
          password: "casesensitive123",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /auth/profile", () => {
    it("devrait retourner le profil avec un token valide", async () => {
      // D'abord, créer et connecter un utilisateur
      const userData = {
        email: "profile@example.com",
        password: "Password123",
      };

      await createTestUser(userData);

      const loginResponse = await request(app)
        .post("/auth/login")
        .send(userData);

      const token = loginResponse.body.data.token;

      // Maintenant, récupérer le profil
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("devrait rejeter une requête sans token", async () => {
      const response = await request(app).get("/auth/profile").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Token manquant");
    });

    it("devrait rejeter un token invalide", async () => {
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", "Bearer invalid.token.here")
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /auth/verify", () => {
    it("devrait vérifier un token valide", async () => {
      const userData = {
        email: "verify@example.com",
        password: "Password123",
      };

      await createTestUser(userData);

      const loginResponse = await request(app)
        .post("/auth/login")
        .send(userData);

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .get("/auth/verify")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Token valide");
      expect(response.body.data.userId).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it("devrait rejeter un token invalide", async () => {
      const response = await request(app)
        .get("/auth/verify")
        .set("Authorization", "Bearer invalid.token")
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
