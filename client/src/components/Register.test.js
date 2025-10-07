import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuth } from "../context/AuthContext";
import Register from "./Register";

// Mock the AuthContext
jest.mock("../context/AuthContext");

// Mock window.alert
global.alert = jest.fn();

describe("Register Component", () => {
  const mockRegister = jest.fn();
  const mockOnSwitchToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      register: mockRegister,
      error: null,
    });
  });

  it("devrait rendre le formulaire d'inscription", () => {
    render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

    expect(screen.getByText(/Inscription/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/votre@email.com/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/mot de passe/i)).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /Créer un compte/i })
    ).toBeInTheDocument();
  });

  it("devrait afficher le lien vers la connexion", () => {
    render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

    const loginLink = screen.getByRole("button", { name: /Se connecter/i });
    expect(loginLink).toBeInTheDocument();
  });

  it("devrait appeler onSwitchToLogin au clic sur le lien", async () => {
    render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

    const loginLink = screen.getByRole("button", { name: /Se connecter/i });
    await userEvent.click(loginLink);

    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });

  it("devrait permettre la saisie des champs", async () => {
    render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const passwordInputs = screen.getAllByPlaceholderText(/mot de passe/i);

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInputs[0], "Password123");
    await userEvent.type(passwordInputs[1], "Password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInputs[0]).toHaveValue("Password123");
    expect(passwordInputs[1]).toHaveValue("Password123");
  });

  it("devrait afficher une erreur pour un email invalide", async () => {
    render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);

    await userEvent.type(emailInput, "invalid-email");
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/Format d'email invalide/i)).toBeInTheDocument();
    });
  });

  it("devrait valider la force du mot de passe", async () => {
    render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

    const passwordInput = screen.getAllByPlaceholderText(/mot de passe/i)[0];

    // Mot de passe faible
    await userEvent.type(passwordInput, "weak");
    expect(screen.getByText(/Faible/i)).toBeInTheDocument();

    // Mot de passe moyen
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "Medium1");
    expect(screen.getByText(/Moyen/i)).toBeInTheDocument();

    // Mot de passe fort
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "Strong123!");
    expect(screen.getByText(/Fort/i)).toBeInTheDocument();
  });

  it("devrait vérifier que les mots de passe correspondent", async () => {
    render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

    const passwordInputs = screen.getAllByPlaceholderText(/mot de passe/i);

    await userEvent.type(passwordInputs[0], "Password123");
    await userEvent.type(passwordInputs[1], "Password123");
    fireEvent.blur(passwordInputs[1]);

    await waitFor(() => {
      expect(
        screen.getByText(/Les mots de passe correspondent/i)
      ).toBeInTheDocument();
    });
  });

  it("devrait afficher une erreur si les mots de passe ne correspondent pas", async () => {
    render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

    const passwordInputs = screen.getAllByPlaceholderText(/mot de passe/i);

    await userEvent.type(passwordInputs[0], "Password123");
    await userEvent.type(passwordInputs[1], "DifferentPassword");
    fireEvent.blur(passwordInputs[1]);

    await waitFor(() => {
      expect(
        screen.getByText(/Les mots de passe ne correspondent pas/i)
      ).toBeInTheDocument();
    });
  });

  it("devrait vérifier la complexité du mot de passe", async () => {
    render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

    const passwordInput = screen.getAllByPlaceholderText(/mot de passe/i)[0];

    // Sans majuscule
    await userEvent.type(passwordInput, "password123");
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/au moins 1 majuscule/i)).toBeInTheDocument();
    });

    // Sans minuscule
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "PASSWORD123");
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/au moins 1 minuscule/i)).toBeInTheDocument();
    });

    // Sans chiffre
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "Password");
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/au moins 1 chiffre/i)).toBeInTheDocument();
    });
  });

  it("devrait soumettre le formulaire avec des données valides", async () => {
    mockRegister.mockResolvedValue({ success: true });

    render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const passwordInputs = screen.getAllByPlaceholderText(/mot de passe/i);
    const submitButton = screen.getByRole("button", {
      name: /Créer un compte/i,
    });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInputs[0], "Password123");
    await userEvent.type(passwordInputs[1], "Password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        "test@example.com",
        "Password123"
      );
    });
  });

  it("devrait afficher une alerte de succès après l'inscription", async () => {
    mockRegister.mockResolvedValue({ success: true });

    render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const passwordInputs = screen.getAllByPlaceholderText(/mot de passe/i);
    const submitButton = screen.getByRole("button", {
      name: /Créer un compte/i,
    });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInputs[0], "Password123");
    await userEvent.type(passwordInputs[1], "Password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("créé avec succès")
      );
    });
  });

  it("ne devrait pas soumettre avec des données invalides", async () => {
    render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const passwordInputs = screen.getAllByPlaceholderText(/mot de passe/i);
    const submitButton = screen.getByRole("button", {
      name: /Créer un compte/i,
    });

    await userEvent.type(emailInput, "invalid-email");
    await userEvent.type(passwordInputs[0], "weak");
    await userEvent.type(passwordInputs[1], "weak");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  it("devrait afficher un message d'erreur du contexte", () => {
    useAuth.mockReturnValue({
      register: mockRegister,
      error: "Cet email est déjà utilisé",
    });

    render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

    expect(screen.getByText(/Cet email est déjà utilisé/i)).toBeInTheDocument();
  });

  it("devrait mettre à jour la validation du confirmPassword quand le password change", async () => {
    render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

    const passwordInputs = screen.getAllByPlaceholderText(/mot de passe/i);

    // Saisir et valider
    await userEvent.type(passwordInputs[0], "Password123");
    await userEvent.type(passwordInputs[1], "Password123");
    fireEvent.blur(passwordInputs[1]);

    await waitFor(() => {
      expect(
        screen.getByText(/Les mots de passe correspondent/i)
      ).toBeInTheDocument();
    });

    // Changer le premier mot de passe
    await userEvent.clear(passwordInputs[0]);
    await userEvent.type(passwordInputs[0], "NewPassword456");

    await waitFor(() => {
      expect(
        screen.getByText(/Les mots de passe ne correspondent pas/i)
      ).toBeInTheDocument();
    });
  });
});
