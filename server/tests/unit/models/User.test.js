import User from "../../../src/models/User.js";
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

describe("User Model - Tests Unitaires", () => {
  beforeAll(async () => {
    await setupDB();
  });

  afterAll(async () => {
    await teardownDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  describe("Validation des champs", () => {
    it("devrait créer et sauvegarder un utilisateur valide", async () => {
      const userData = {
        email: "test@example.com",
        password: "Test123456",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.createdAt).toBeDefined();
    });

    it("devrait rejeter un utilisateur sans email", async () => {
      const user = new User({
        password: "Test123456",
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("devrait rejeter un utilisateur sans mot de passe", async () => {
      const user = new User({
        email: "test@example.com",
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("devrait rejeter un email invalide", async () => {
      const user = new User({
        email: "invalid-email",
        password: "Test123456",
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("devrait rejeter un mot de passe trop court", async () => {
      const user = new User({
        email: "test@example.com",
        password: "12345", // moins de 6 caractères
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("devrait rejeter un email en double", async () => {
      const userData = {
        email: "duplicate@example.com",
        password: "Test123456",
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      await expect(user2.save()).rejects.toThrow();
    });

    it("devrait normaliser l'email en minuscules", async () => {
      const user = new User({
        email: "TEST@EXAMPLE.COM",
        password: "Test123456",
      });

      const savedUser = await user.save();
      expect(savedUser.email).toBe("test@example.com");
    });

    it("devrait trim les espaces de l'email", async () => {
      const user = new User({
        email: "  test@example.com  ",
        password: "Test123456",
      });

      const savedUser = await user.save();
      expect(savedUser.email).toBe("test@example.com");
    });
  });

  describe("Hashing du mot de passe", () => {
    it("devrait hasher le mot de passe avant de sauvegarder", async () => {
      const userData = {
        email: "hash@example.com",
        password: "PlainPassword123",
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$/); // Format bcrypt
    });

    it("ne devrait pas re-hasher le mot de passe s'il n'a pas été modifié", async () => {
      const userData = {
        email: "nohash@example.com",
        password: "Password123",
      };

      const user = new User(userData);
      await user.save();
      const firstHash = user.password;

      // Modifier un autre champ
      user.email = "newemail@example.com";
      await user.save();

      expect(user.password).toBe(firstHash);
    });

    it("devrait re-hasher le mot de passe s'il est modifié", async () => {
      const user = new User({
        email: "rehash@example.com",
        password: "OldPassword123",
      });
      await user.save();
      const firstHash = user.password;

      user.password = "NewPassword456";
      await user.save();

      expect(user.password).not.toBe(firstHash);
      expect(user.password).toMatch(/^\$2[aby]\$/);
    });
  });

  describe("comparePassword method", () => {
    it("devrait retourner true pour un mot de passe correct", async () => {
      const plainPassword = "CorrectPass123";
      const user = new User({
        email: "compare@example.com",
        password: plainPassword,
      });
      await user.save();

      const isMatch = await user.comparePassword(plainPassword);
      expect(isMatch).toBe(true);
    });

    it("devrait retourner false pour un mot de passe incorrect", async () => {
      const user = new User({
        email: "compare2@example.com",
        password: "CorrectPass123",
      });
      await user.save();

      const isMatch = await user.comparePassword("WrongPassword");
      expect(isMatch).toBe(false);
    });

    it("devrait être sensible à la casse", async () => {
      const user = new User({
        email: "compare3@example.com",
        password: "CaseSensitive123",
      });
      await user.save();

      const isMatch = await user.comparePassword("casesensitive123");
      expect(isMatch).toBe(false);
    });
  });

  describe("toJSON method", () => {
    it("ne devrait pas inclure le mot de passe dans le JSON", async () => {
      const user = new User({
        email: "json@example.com",
        password: "Password123",
      });
      await user.save();

      const userJSON = user.toJSON();

      expect(userJSON.password).toBeUndefined();
      expect(userJSON.email).toBeDefined();
      expect(userJSON._id).toBeDefined();
    });

    it("devrait inclure tous les autres champs dans le JSON", async () => {
      const user = new User({
        email: "json2@example.com",
        password: "Password123",
      });
      await user.save();

      const userJSON = user.toJSON();

      expect(userJSON._id).toBeDefined();
      expect(userJSON.email).toBe("json2@example.com");
      expect(userJSON.createdAt).toBeDefined();
    });
  });

  describe("Timestamps", () => {
    it("devrait ajouter automatiquement createdAt", async () => {
      const user = new User({
        email: "timestamp@example.com",
        password: "Password123",
      });

      const savedUser = await user.save();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.createdAt).toBeInstanceOf(Date);
    });

    it("createdAt devrait être proche du moment actuel", async () => {
      const before = new Date();

      const user = new User({
        email: "timestamp2@example.com",
        password: "Password123",
      });
      await user.save();

      const after = new Date();

      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
