import { optionalAuth, requireAuth } from "../../../src/middleware/auth.js";
import { createTestUserWithToken } from "../../helpers/testHelpers.js";
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
describe("Auth Middleware - Tests d'intégration", () => {
  beforeAll(async () => {
    await setupDB();
  });

  afterAll(async () => {
    await teardownDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  describe("requireAuth middleware", () => {
    it("devrait autoriser une requête avec un token valide", async () => {
      const { user, token } = await createTestUserWithToken();

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userId).toBeDefined();
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe(user.email);
      expect(req.user.password).toBeUndefined();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("devrait rejeter une requête sans token", async () => {
      const req = {
        headers: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Accès refusé. Token manquant.",
      });
    });

    it("devrait rejeter une requête avec un token sans Bearer", async () => {
      const { token } = await createTestUserWithToken();

      const req = {
        headers: {
          authorization: token, // Sans "Bearer "
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Accès refusé. Token manquant.",
      });
    });

    it("devrait rejeter une requête avec un token invalide", async () => {
      const req = {
        headers: {
          authorization: "Bearer invalid.token.here",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Token invalide ou expiré. Accès refusé.",
      });
    });

    it("devrait rejeter un token pour un utilisateur qui n'existe plus", async () => {
      const { user, token } = await createTestUserWithToken();

      // Supprimer l'utilisateur
      await user.deleteOne();

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Utilisateur introuvable. Accès refusé.",
      });
    });

    it("devrait rejeter un token avec une signature altérée", async () => {
      const { token } = await createTestUserWithToken();

      // Altérer la signature
      const parts = token.split(".");
      const tamperedToken = parts[0] + "." + parts[1] + ".tampered";

      const req = {
        headers: {
          authorization: `Bearer ${tamperedToken}`,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("devrait définir req.userId et req.user correctement", async () => {
      const { user, token } = await createTestUserWithToken({
        email: "middleware@example.com",
      });

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(req.userId.toString()).toBe(user._id.toString());
      expect(req.user._id.toString()).toBe(user._id.toString());
      expect(req.user.email).toBe("middleware@example.com");
    });
  });

  describe("optionalAuth middleware", () => {
    it("devrait définir req.user si un token valide est fourni", async () => {
      const { user, token } = await createTestUserWithToken();

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = {};
      const next = jest.fn();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userId).toBeDefined();
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe(user.email);
    });

    it("devrait continuer sans définir req.user si aucun token n'est fourni", async () => {
      const req = {
        headers: {},
      };
      const res = {};
      const next = jest.fn();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userId).toBeUndefined();
      expect(req.user).toBeUndefined();
    });

    it("devrait continuer sans définir req.user si le token est invalide", async () => {
      const req = {
        headers: {
          authorization: "Bearer invalid.token.here",
        },
      };
      const res = {};
      const next = jest.fn();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userId).toBeUndefined();
      expect(req.user).toBeUndefined();
    });

    it("ne devrait jamais rejeter la requête", async () => {
      const req = {
        headers: {
          authorization: "Bearer totally.invalid.token",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("devrait gérer les tokens sans Bearer prefix", async () => {
      const { token } = await createTestUserWithToken();

      const req = {
        headers: {
          authorization: token, // Sans "Bearer "
        },
      };
      const res = {};
      const next = jest.fn();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined(); // Pas de Bearer, donc ignoré
    });
  });

  describe("Scénarios edge case", () => {
    it("requireAuth devrait gérer un header Authorization vide", async () => {
      const req = {
        headers: {
          authorization: "",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('requireAuth devrait gérer un header Authorization avec seulement "Bearer"', async () => {
      const req = {
        headers: {
          authorization: "Bearer",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("requireAuth devrait gérer des headers mal formés", async () => {
      const req = {
        headers: {
          authorization: "Basic sometoken",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("devrait permettre plusieurs requêtes avec le même token", async () => {
      const { user, token } = await createTestUserWithToken();

      for (let i = 0; i < 3; i++) {
        const req = {
          headers: {
            authorization: `Bearer ${token}`,
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();

        await requireAuth(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user.email).toBe(user.email);
      }
    });
  });
});
