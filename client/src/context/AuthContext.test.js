import { act, renderHook, waitFor } from "@testing-library/react";
import apiClient from "../api/client";
import { AuthProvider, useAuth } from "./AuthContext";

// Mock the API client
jest.mock("../api/client");

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("useAuth hook", () => {
    it("devrait lancer une erreur si utilisé en dehors d'AuthProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within AuthProvider");

      consoleSpy.mockRestore();
    });

    it("devrait retourner le contexte quand utilisé dans AuthProvider", () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toHaveProperty("user");
      expect(result.current).toHaveProperty("token");
      expect(result.current).toHaveProperty("contacts");
      expect(result.current).toHaveProperty("loading");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("register");
      expect(result.current).toHaveProperty("login");
      expect(result.current).toHaveProperty("logout");
      expect(result.current).toHaveProperty("loadContacts");
      expect(result.current).toHaveProperty("createContact");
      expect(result.current).toHaveProperty("updateContact");
      expect(result.current).toHaveProperty("deleteContact");
    });
  });

  describe("État initial", () => {
    it("devrait avoir un état initial correct sans données sauvegardées", () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.contacts).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("devrait charger les données sauvegardées du localStorage", () => {
      const savedUser = { _id: "123", email: "test@example.com" };
      const savedToken = "saved-token";

      localStorage.setItem("user", JSON.stringify(savedUser));
      localStorage.setItem("token", savedToken);

      apiClient.get.mockResolvedValue({
        contacts: [],
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toEqual(savedUser);
      expect(result.current.token).toBe(savedToken);
    });
  });

  describe("register function", () => {
    it("devrait enregistrer un utilisateur avec succès", async () => {
      const mockResponse = {
        data: {
          user: { _id: "123", email: "new@example.com" },
          token: "new-token",
        },
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let response;
      await act(async () => {
        response = await result.current.register("new@example.com", "Pass123");
      });

      expect(response.success).toBe(true);
      expect(result.current.user).toEqual(mockResponse.data.user);
      expect(result.current.token).toBe(mockResponse.data.token);
      expect(localStorage.getItem("token")).toBe(mockResponse.data.token);
      expect(JSON.parse(localStorage.getItem("user"))).toEqual(
        mockResponse.data.user
      );
    });

    it("devrait gérer les erreurs d'inscription", async () => {
      const error = new Error("Email déjà utilisé");
      apiClient.post.mockRejectedValue(error);

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let response;
      await act(async () => {
        response = await result.current.register("test@example.com", "Pass123");
      });

      expect(response.success).toBe(false);
      expect(result.current.error).toBe(error.message);
      expect(result.current.user).toBeNull();
    });
  });

  describe("login function", () => {
    it("devrait connecter un utilisateur avec succès", async () => {
      const mockResponse = {
        data: {
          user: { _id: "123", email: "login@example.com" },
          token: "login-token",
        },
      };

      apiClient.post.mockResolvedValue(mockResponse);
      apiClient.get.mockResolvedValue({ contacts: [] });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let response;
      await act(async () => {
        response = await result.current.login("login@example.com", "Pass123");
      });

      await waitFor(() => {
        expect(response.success).toBe(true);
        expect(result.current.user).toEqual(mockResponse.data.user);
        expect(result.current.token).toBe(mockResponse.data.token);
      });
    });

    it("devrait charger les contacts après la connexion", async () => {
      const mockContacts = [
        { _id: "1", firstName: "Jean", lastName: "Dupont" },
        { _id: "2", firstName: "Marie", lastName: "Martin" },
      ];

      apiClient.post.mockResolvedValue({
        data: {
          user: { _id: "123", email: "test@example.com" },
          token: "token",
        },
      });

      apiClient.get.mockResolvedValue({ contacts: mockContacts });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login("test@example.com", "Pass123");
      });

      await waitFor(() => {
        expect(result.current.contacts).toEqual(mockContacts);
      });
    });

    it("devrait gérer les erreurs de connexion", async () => {
      const error = new Error("Email ou mot de passe incorrect");
      apiClient.post.mockRejectedValue(error);

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let response;
      await act(async () => {
        response = await result.current.login("wrong@example.com", "wrong");
      });

      expect(response.success).toBe(false);
      expect(result.current.error).toBe(error.message);
    });
  });

  describe("logout function", () => {
    it("devrait déconnecter l'utilisateur et effacer les données", () => {
      localStorage.setItem("user", JSON.stringify({ id: "123" }));
      localStorage.setItem("token", "some-token");

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.contacts).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
      expect(localStorage.getItem("token")).toBeNull();
    });
  });

  describe("loadContacts function", () => {
    it("devrait charger les contacts avec succès", async () => {
      const mockContacts = [
        { _id: "1", firstName: "Contact1" },
        { _id: "2", firstName: "Contact2" },
      ];

      apiClient.get.mockResolvedValue({ contacts: mockContacts });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.loadContacts();
      });

      expect(result.current.contacts).toEqual(mockContacts);
      expect(result.current.error).toBeNull();
    });

    it("devrait gérer les erreurs de chargement", async () => {
      const error = new Error("Erreur de chargement");
      apiClient.get.mockRejectedValue(error);

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.loadContacts();
      });

      expect(result.current.error).toBe(error.message);
    });
  });

  describe("createContact function", () => {
    it("devrait créer un contact avec succès", async () => {
      const newContact = {
        _id: "123",
        firstName: "New",
        lastName: "Contact",
      };

      apiClient.post.mockResolvedValue({ contact: newContact });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let response;
      await act(async () => {
        response = await result.current.createContact({
          firstName: "New",
          lastName: "Contact",
        });
      });

      expect(response.success).toBe(true);
      expect(result.current.contacts).toContainEqual(newContact);
    });

    it("devrait gérer les erreurs de création", async () => {
      const error = new Error("Erreur de création");
      apiClient.post.mockRejectedValue(error);

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let response;
      await act(async () => {
        response = await result.current.createContact({ firstName: "Test" });
      });

      expect(response.success).toBe(false);
      expect(result.current.error).toBe(error.message);
    });
  });

  describe("updateContact function", () => {
    it("devrait mettre à jour un contact avec succès", async () => {
      const existingContact = {
        _id: "1",
        firstName: "Old",
        lastName: "Name",
      };
      const updatedContact = { _id: "1", firstName: "New", lastName: "Name" };

      apiClient.get.mockResolvedValue({ contacts: [existingContact] });
      apiClient.patch.mockResolvedValue({ contact: updatedContact });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.loadContacts();
      });

      await act(async () => {
        await result.current.updateContact("1", { firstName: "New" });
      });

      expect(result.current.contacts).toContainEqual(updatedContact);
      expect(result.current.contacts).not.toContainEqual(existingContact);
    });

    it("devrait gérer les erreurs de mise à jour", async () => {
      const error = new Error("Erreur de mise à jour");
      apiClient.patch.mockRejectedValue(error);

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let response;
      await act(async () => {
        response = await result.current.updateContact("1", {
          firstName: "New",
        });
      });

      expect(response.success).toBe(false);
      expect(result.current.error).toBe(error.message);
    });
  });

  describe("deleteContact function", () => {
    it("devrait supprimer un contact avec succès", async () => {
      const contacts = [
        { _id: "1", firstName: "Keep" },
        { _id: "2", firstName: "Delete" },
      ];

      apiClient.get.mockResolvedValue({ contacts });
      apiClient.delete.mockResolvedValue({ success: true });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.loadContacts();
      });

      await act(async () => {
        await result.current.deleteContact("2");
      });

      expect(result.current.contacts).toHaveLength(1);
      expect(result.current.contacts[0]._id).toBe("1");
    });

    it("devrait gérer les erreurs de suppression", async () => {
      const error = new Error("Erreur de suppression");
      apiClient.delete.mockRejectedValue(error);

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let response;
      await act(async () => {
        response = await result.current.deleteContact("1");
      });

      expect(response.success).toBe(false);
      expect(result.current.error).toBe(error.message);
    });
  });
});
