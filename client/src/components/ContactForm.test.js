import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuth } from "../context/AuthContext";
import ContactForm from "./ContactForm";

jest.mock("../context/AuthContext");

describe("ContactForm Component", () => {
  const mockCreateContact = jest.fn();
  const mockUpdateContact = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      createContact: mockCreateContact,
      updateContact: mockUpdateContact,
      error: null,
    });
  });

  it("devrait rendre le formulaire d'ajout de contact", () => {
    render(<ContactForm onClose={mockOnClose} />);

    expect(screen.getByText(/Ajouter un contact/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Jean/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Dupont/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/\+33 6 12 34 56 78/i)
    ).toBeInTheDocument();
  });

  it("devrait rendre le formulaire de modification avec des données pré-remplies", () => {
    const contact = {
      _id: "123",
      firstName: "Jean",
      lastName: "Dupont",
      phone: "+33 6 12 34 56 78",
      email: "jean.dupont@example.com",
      address: "123 Rue de la Paix",
    };

    render(<ContactForm contact={contact} onClose={mockOnClose} />);

    expect(screen.getByText(/Modifier le contact/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Jean")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Dupont")).toBeInTheDocument();
    expect(screen.getByDisplayValue("+33 6 12 34 56 78")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("jean.dupont@example.com")
    ).toBeInTheDocument();
  });

  it("devrait valider le firstName", async () => {
    render(<ContactForm onClose={mockOnClose} />);

    const firstNameInput = screen.getByPlaceholderText(/Jean/i);

    // Trop court
    await userEvent.type(firstNameInput, "J");
    fireEvent.blur(firstNameInput);

    await waitFor(() => {
      expect(screen.getByText(/Minimum 2 caractères/i)).toBeInTheDocument();
    });

    // Caractères invalides
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, "Jean123");
    fireEvent.blur(firstNameInput);

    await waitFor(() => {
      expect(screen.getByText(/Caractères invalides/i)).toBeInTheDocument();
    });
  });

  it("devrait valider le téléphone", async () => {
    render(<ContactForm onClose={mockOnClose} />);

    const phoneInput = screen.getByPlaceholderText(/\+33 6 12 34 56 78/i);

    // Trop court
    await userEvent.type(phoneInput, "123");
    fireEvent.blur(phoneInput);

    await waitFor(() => {
      expect(screen.getByText(/Minimum 10 chiffres/i)).toBeInTheDocument();
    });
  });

  it("devrait valider l'email optionnel", async () => {
    render(<ContactForm onClose={mockOnClose} />);

    const emailInput = screen.getByPlaceholderText(/jean.dupont@email.com/i);

    // Email invalide
    await userEvent.type(emailInput, "invalid-email");
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/Format d'email invalide/i)).toBeInTheDocument();
    });
  });

  it("devrait afficher le compteur de caractères pour l'adresse", async () => {
    render(<ContactForm onClose={mockOnClose} />);

    const addressInput = screen.getByPlaceholderText(/123 Rue de la Paix/i);

    expect(screen.getByText(/0\/200 caractères/i)).toBeInTheDocument();

    await userEvent.type(addressInput, "Paris");

    expect(screen.getByText(/5\/200 caractères/i)).toBeInTheDocument();
  });

  it("devrait créer un contact avec des données valides", async () => {
    mockCreateContact.mockResolvedValue({ success: true });

    render(<ContactForm onClose={mockOnClose} />);

    await userEvent.type(screen.getByPlaceholderText(/Jean/i), "Pierre");
    await userEvent.type(screen.getByPlaceholderText(/Dupont/i), "Martin");
    await userEvent.type(
      screen.getByPlaceholderText(/\+33 6 12 34 56 78/i),
      "+33 6 98 76 54 32"
    );

    const submitButton = screen.getByRole("button", {
      name: /Créer/i,
    });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateContact).toHaveBeenCalledWith({
        firstName: "Pierre",
        lastName: "Martin",
        phone: "+33 6 98 76 54 32",
        email: "",
        address: "",
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("devrait mettre à jour un contact existant", async () => {
    mockUpdateContact.mockResolvedValue({ success: true });

    const contact = {
      _id: "123",
      firstName: "Jean",
      lastName: "Dupont",
      phone: "+33 6 12 34 56 78",
      email: "",
      address: "",
    };

    render(<ContactForm contact={contact} onClose={mockOnClose} />);

    const firstNameInput = screen.getByDisplayValue("Jean");
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, "Paul");

    const submitButton = screen.getByRole("button", {
      name: /Mettre à jour/i,
    });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateContact).toHaveBeenCalledWith("123", {
        firstName: "Paul",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        email: "",
        address: "",
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("ne devrait pas soumettre avec des données invalides", async () => {
    render(<ContactForm onClose={mockOnClose} />);

    await userEvent.type(screen.getByPlaceholderText(/Jean/i), "J");
    await userEvent.type(screen.getByPlaceholderText(/Dupont/i), "D");
    await userEvent.type(
      screen.getByPlaceholderText(/\+33 6 12 34 56 78/i),
      "123"
    );

    const submitButton = screen.getByRole("button", { name: /Créer/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateContact).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it("devrait appeler onClose quand on clique sur Annuler", async () => {
    render(<ContactForm onClose={mockOnClose} />);

    const cancelButton = screen.getByRole("button", { name: /Annuler/i });
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("devrait afficher les erreurs du contexte", () => {
    useAuth.mockReturnValue({
      createContact: mockCreateContact,
      updateContact: mockUpdateContact,
      error: "Erreur lors de la création",
    });

    render(<ContactForm onClose={mockOnClose} />);

    expect(screen.getByText(/Erreur lors de la création/i)).toBeInTheDocument();
  });

  it("devrait afficher les classes d'erreur sur les champs invalides", async () => {
    render(<ContactForm onClose={mockOnClose} />);

    const firstNameInput = screen.getByPlaceholderText(/Jean/i);

    await userEvent.type(firstNameInput, "J");
    fireEvent.blur(firstNameInput);

    await waitFor(() => {
      expect(firstNameInput).toHaveClass("input-error");
    });
  });
});
