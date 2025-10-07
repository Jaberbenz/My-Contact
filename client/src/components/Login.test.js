import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";

// Mock the AuthContext
jest.mock("../context/AuthContext");

describe("Login Component", () => {
  const mockLogin = jest.fn();
  const mockOnSwitchToRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      login: mockLogin,
      error: null,
    });
  });

  it("devrait rendre le formulaire de connexion", () => {
    render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

    expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/votre@email.com/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Votre mot de passe/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Se connecter/i })
    ).toBeInTheDocument();
  });

  it("devrait afficher le lien vers l'inscription", () => {
    render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

    const registerLink = screen.getByRole("button", {
      name: /Créer un compte/i,
    });
    expect(registerLink).toBeInTheDocument();
  });

  it("devrait appeler onSwitchToRegister au clic sur le lien", async () => {
    render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

    const registerLink = screen.getByRole("button", {
      name: /Créer un compte/i,
    });
    await userEvent.click(registerLink);

    expect(mockOnSwitchToRegister).toHaveBeenCalled();
  });

  it("devrait permettre la saisie de l'email et du mot de passe", async () => {
    render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/Votre mot de passe/i);

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("devrait afficher une erreur pour un email invalide au blur", async () => {
    render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);

    await userEvent.type(emailInput, "invalid-email");
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/Format d'email invalide/i)).toBeInTheDocument();
    });
  });

  it("devrait afficher une erreur pour un mot de passe trop court", async () => {
    render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

    const passwordInput = screen.getByPlaceholderText(/Votre mot de passe/i);

    await userEvent.type(passwordInput, "12345");
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/au moins 6 caractères/i)).toBeInTheDocument();
    });
  });

  it("devrait soumettre le formulaire avec des données valides", async () => {
    mockLogin.mockResolvedValue({ success: true });

    render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/Votre mot de passe/i);
    const submitButton = screen.getByRole("button", {
      name: /Se connecter/i,
    });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "Password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "Password123");
    });
  });

  it("ne devrait pas soumettre si l'email est invalide", async () => {
    render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/Votre mot de passe/i);
    const submitButton = screen.getByRole("button", {
      name: /Se connecter/i,
    });

    await userEvent.type(emailInput, "invalid-email");
    await userEvent.type(passwordInput, "Password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it("ne devrait pas soumettre si le mot de passe est trop court", async () => {
    render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/Votre mot de passe/i);
    const submitButton = screen.getByRole("button", {
      name: /Se connecter/i,
    });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it("devrait afficher un message d'erreur du contexte", () => {
    useAuth.mockReturnValue({
      login: mockLogin,
      error: "Email ou mot de passe incorrect",
    });

    render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

    expect(
      screen.getByText(/Email ou mot de passe incorrect/i)
    ).toBeInTheDocument();
  });

  it("devrait mettre à jour les erreurs en temps réel après le premier blur", async () => {
    render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);

    // Premier blur pour activer la validation
    await userEvent.type(emailInput, "invalid");
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/Format d'email invalide/i)).toBeInTheDocument();
    });

    // Correction de l'email
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "valid@example.com");

    await waitFor(() => {
      expect(
        screen.queryByText(/Format d'email invalide/i)
      ).not.toBeInTheDocument();
    });
  });
});
