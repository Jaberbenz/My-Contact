import User from "../../../src/models/User.js";
import {
  authenticateUser,
  createUserWithToken,
  generateToken,
  verifyToken,
} from "../../../src/services/authService.js";
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

describe("AuthService - Tests Unitaires", () => {
  beforeAll(async () => {
    await setupDB();
  });

  afterAll(async () => {
    await teardownDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  describe("generateToken", () => {
    it("devrait générer un token JWT valide", () => {
      const userId = "507f1f77bcf86cd799439011";
      const token = generateToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // Format JWT: header.payload.signature
    });

    it("devrait générer des tokens différents pour des userId différents", () => {
      const userId1 = "507f1f77bcf86cd799439011";
      const userId2 = "507f1f77bcf86cd799439012";

      const token1 = generateToken(userId1);
      const token2 = generateToken(userId2);

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyToken", () => {
    it("devrait vérifier et décoder un token valide", () => {
      const userId = "507f1f77bcf86cd799439011";
      const token = generateToken(userId);

      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(userId);
      expect(decoded.iat).toBeDefined(); // issued at
      expect(decoded.exp).toBeDefined(); // expiration
    });

    it("devrait rejeter un token invalide", () => {
      const invalidToken = "invalid.token.here";

      expect(() => verifyToken(invalidToken)).toThrow("token pas valide");
    });

    it("devrait rejeter un token expiré", () => {
      // Créer un token qui expire immédiatement
      const oldJwtExpiresIn = process.env.JWT_EXPIRES_IN;
      process.env.JWT_EXPIRES_IN = "0s";

      const userId = "507f1f77bcf86cd799439011";
      const token = generateToken(userId);

      // Attendre un peu pour que le token expire
      setTimeout(() => {
        expect(() => verifyToken(token)).toThrow();
        process.env.JWT_EXPIRES_IN = oldJwtExpiresIn;
      }, 100);
    });

    it("devrait rejeter un token avec une mauvaise signature", () => {
      const userId = "507f1f77bcf86cd799439011";
      const token = generateToken(userId);

      // Modifier la signature du token
      const parts = token.split(".");
      const tamperedToken = parts[0] + "." + parts[1] + ".tampered";

      expect(() => verifyToken(tamperedToken)).toThrow("token pas valide");
    });
  });

  describe("createUserWithToken", () => {
    it("devrait créer un utilisateur et générer un token", async () => {
      const userData = {
        email: "newuser@example.com",
        password: "Password123",
      };

      const result = await createUserWithToken(userData);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.password).toBeUndefined(); // Le password ne doit pas être dans le JSON

      // Vérifier que l'utilisateur a été créé dans la DB
      const userInDB = await User.findById(result.user._id);
      expect(userInDB).toBeDefined();
      expect(userInDB.email).toBe(userData.email);
    });

    it("devrait hasher le mot de passe", async () => {
      const userData = {
        email: "newuser2@example.com",
        password: "Password123",
      };

      const result = await createUserWithToken(userData);
      const userInDB = await User.findById(result.user._id);

      expect(userInDB.password).not.toBe(userData.password);
      expect(userInDB.password).toMatch(/^\$2[aby]\$/); // Format bcrypt
    });

    it("devrait générer un token valide pour le nouvel utilisateur", async () => {
      const userData = {
        email: "newuser3@example.com",
        password: "Password123",
      };

      const result = await createUserWithToken(userData);
      const decoded = verifyToken(result.token);

      expect(decoded.userId).toBe(result.user._id.toString());
    });
  });

  describe("authenticateUser", () => {
    it("devrait authentifier un utilisateur avec des identifiants valides", async () => {
      const userData = {
        email: "auth@example.com",
        password: "AuthPass123",
      };

      await createTestUser(userData);

      const result = await authenticateUser(userData.email, userData.password);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.password).toBeUndefined();
    });

    it("devrait rejeter un email inexistant", async () => {
      await expect(
        authenticateUser("nonexistent@example.com", "Password123")
      ).rejects.toThrow("Email ou mot de passe invalide");
    });

    it("devrait rejeter un mot de passe incorrect", async () => {
      const userData = {
        email: "auth2@example.com",
        password: "CorrectPass123",
      };

      await createTestUser(userData);

      await expect(
        authenticateUser(userData.email, "WrongPassword")
      ).rejects.toThrow("Email ou mot de passe incorrect");
    });

    it("devrait générer un token valide lors de l'authentification", async () => {
      const userData = {
        email: "auth3@example.com",
        password: "AuthPass123",
      };

      const user = await createTestUser(userData);
      const result = await authenticateUser(userData.email, userData.password);
      const decoded = verifyToken(result.token);

      expect(decoded.userId).toBe(user._id.toString());
    });

    it("devrait être sensible à la casse pour le mot de passe", async () => {
      const userData = {
        email: "auth4@example.com",
        password: "CaseSensitive123",
      };

      await createTestUser(userData);

      await expect(
        authenticateUser(userData.email, "casesensitive123")
      ).rejects.toThrow();
    });

    it("devrait normaliser l'email en minuscules", async () => {
      const userData = {
        email: "Auth5@Example.COM",
        password: "Pass123",
      };

      await createTestUser(userData);

      const result = await authenticateUser("auth5@example.com", "Pass123");
      expect(result.user.email).toBe("auth5@example.com");
    });
  });
});
