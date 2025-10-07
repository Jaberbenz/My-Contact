import apiClient from "./client";

// Mock global fetch
global.fetch = jest.fn();

describe("API Client", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("request method", () => {
    it("devrait effectuer une requête GET avec succès", async () => {
      const mockData = { success: true, data: { id: 1, name: "Test" } };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await apiClient.get("/test-endpoint");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/test-endpoint"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it("devrait inclure le token d'authentification si présent", async () => {
      const token = "test-token-123";
      localStorage.setItem("token", token);

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      await apiClient.get("/protected-endpoint");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        })
      );
    });

    it("ne devrait pas inclure le token si absent", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      await apiClient.get("/public-endpoint");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.anything(),
          }),
        })
      );
    });

    it("devrait gérer les erreurs HTTP", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: "Erreur de validation" }),
      });

      await expect(apiClient.get("/error-endpoint")).rejects.toThrow(
        "Erreur de validation"
      );
    });

    it("devrait gérer les erreurs 401 et déconnecter l'utilisateur", async () => {
      localStorage.setItem("token", "expired-token");
      localStorage.setItem("user", JSON.stringify({ id: 1 }));

      // Mock window.location.reload
      delete window.location;
      window.location = { reload: jest.fn() };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Non autorisé" }),
      });

      await expect(apiClient.get("/protected")).rejects.toThrow("Non autorisé");

      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
      expect(window.location.reload).toHaveBeenCalled();
    });

    it("devrait gérer les erreurs réseau", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(apiClient.get("/endpoint")).rejects.toThrow("Network error");
    });
  });

  describe("GET method", () => {
    it("devrait effectuer une requête GET", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: "test" }),
      });

      await apiClient.get("/test");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          method: "GET",
        })
      );
    });
  });

  describe("POST method", () => {
    it("devrait effectuer une requête POST avec un body", async () => {
      const postData = { name: "Test", value: 123 };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ success: true, data: postData }),
      });

      await apiClient.post("/create", postData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(postData),
        })
      );
    });
  });

  describe("PATCH method", () => {
    it("devrait effectuer une requête PATCH avec un body", async () => {
      const updateData = { name: "Updated" };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      await apiClient.patch("/update/1", updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(updateData),
        })
      );
    });
  });

  describe("DELETE method", () => {
    it("devrait effectuer une requête DELETE", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      await apiClient.delete("/delete/1");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  describe("API URL configuration", () => {
    it("devrait utiliser l'URL de l'environnement ou localhost par défaut", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      await apiClient.get("/test");

      const callUrl = global.fetch.mock.calls[0][0];
      expect(callUrl).toMatch(/^http:\/\/localhost:3000\/test$/);
    });
  });
});
