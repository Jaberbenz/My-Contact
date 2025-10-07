import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuth } from "../context/AuthContext";
import ContactList from "./ContactList";

jest.mock("../context/AuthContext");
jest.mock("./ContactForm", () => {
  return function MockContactForm({ onClose }) {
    return (
      <div data-testid="contact-form">
        <button onClick={onClose}>Close Form</button>
      </div>
    );
  };
});

// Mock window.confirm
global.confirm = jest.fn();

describe("ContactList Component", () => {
  const mockLogout = jest.fn();
  const mockDeleteContact = jest.fn();

  const mockUser = {
    _id: "123",
    email: "test@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.confirm.mockReturnValue(false);
  });

  it("devrait afficher le header avec l'email de l'utilisateur", () => {
    useAuth.mockReturnValue({
      user: mockUser,
      contacts: [],
      logout: mockLogout,
      deleteContact: mockDeleteContact,
    });

    render(<ContactList />);

    expect(screen.getByText(/Mes Contacts/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Déconnexion/i })
    ).toBeInTheDocument();
  });

  it("devrait appeler logout quand on clique sur Déconnexion", async () => {
    useAuth.mockReturnValue({
      user: mockUser,
      contacts: [],
      logout: mockLogout,
      deleteContact: mockDeleteContact,
    });

    render(<ContactList />);

    const logoutButton = screen.getByRole("button", { name: /Déconnexion/i });
    await userEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it("devrait afficher le message d'état vide quand il n'y a pas de contacts", () => {
    useAuth.mockReturnValue({
      user: mockUser,
      contacts: [],
      logout: mockLogout,
      deleteContact: mockDeleteContact,
    });

    render(<ContactList />);

    expect(screen.getByText(/Aucun contact/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Commencez par ajouter votre premier contact/i)
    ).toBeInTheDocument();
  });

  it("devrait afficher la liste des contacts", () => {
    const mockContacts = [
      {
        _id: "1",
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        email: "jean@example.com",
        address: "Paris",
      },
      {
        _id: "2",
        firstName: "Marie",
        lastName: "Martin",
        phone: "+33 6 98 76 54 32",
      },
    ];

    useAuth.mockReturnValue({
      user: mockUser,
      contacts: mockContacts,
      logout: mockLogout,
      deleteContact: mockDeleteContact,
    });

    render(<ContactList />);

    expect(screen.getByText(/Jean Dupont/i)).toBeInTheDocument();
    expect(screen.getByText(/Marie Martin/i)).toBeInTheDocument();
    expect(screen.getByText(/\+33 6 12 34 56 78/i)).toBeInTheDocument();
    expect(screen.getByText(/jean@example.com/i)).toBeInTheDocument();
  });

  it("devrait afficher le nombre de contacts", () => {
    const mockContacts = [
      {
        _id: "1",
        firstName: "Jean",
        lastName: "Dupont",
        phone: "123456",
      },
      {
        _id: "2",
        firstName: "Marie",
        lastName: "Martin",
        phone: "789012",
      },
    ];

    useAuth.mockReturnValue({
      user: mockUser,
      contacts: mockContacts,
      logout: mockLogout,
      deleteContact: mockDeleteContact,
    });

    render(<ContactList />);

    expect(screen.getByText(/2 contacts/i)).toBeInTheDocument();
  });

  it("devrait afficher 'contact' au singulier pour 1 contact", () => {
    const mockContacts = [
      {
        _id: "1",
        firstName: "Jean",
        lastName: "Dupont",
        phone: "123456",
      },
    ];

    useAuth.mockReturnValue({
      user: mockUser,
      contacts: mockContacts,
      logout: mockLogout,
      deleteContact: mockDeleteContact,
    });

    render(<ContactList />);

    expect(screen.getByText(/1 contact$/i)).toBeInTheDocument();
  });

  it("devrait ouvrir le formulaire d'ajout", async () => {
    useAuth.mockReturnValue({
      user: mockUser,
      contacts: [],
      logout: mockLogout,
      deleteContact: mockDeleteContact,
    });

    render(<ContactList />);

    const addButton = screen.getByRole("button", {
      name: /Ajouter un contact/i,
    });
    await userEvent.click(addButton);

    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
  });

  it("devrait ouvrir le formulaire de modification", async () => {
    const mockContacts = [
      {
        _id: "1",
        firstName: "Jean",
        lastName: "Dupont",
        phone: "123456",
      },
    ];

    useAuth.mockReturnValue({
      user: mockUser,
      contacts: mockContacts,
      logout: mockLogout,
      deleteContact: mockDeleteContact,
    });

    render(<ContactList />);

    const editButton = screen.getByRole("button", { name: /Modifier/i });
    await userEvent.click(editButton);

    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
  });

  it("devrait fermer le formulaire", async () => {
    useAuth.mockReturnValue({
      user: mockUser,
      contacts: [],
      logout: mockLogout,
      deleteContact: mockDeleteContact,
    });

    render(<ContactList />);

    // Ouvrir le formulaire
    const addButton = screen.getByRole("button", {
      name: /Ajouter un contact/i,
    });
    await userEvent.click(addButton);

    expect(screen.getByTestId("contact-form")).toBeInTheDocument();

    // Fermer le formulaire
    const closeButton = screen.getByRole("button", { name: /Close Form/i });
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId("contact-form")).not.toBeInTheDocument();
    });
  });

  it("devrait supprimer un contact après confirmation", async () => {
    global.confirm.mockReturnValue(true);
    mockDeleteContact.mockResolvedValue({ success: true });

    const mockContacts = [
      {
        _id: "1",
        firstName: "Jean",
        lastName: "Dupont",
        phone: "123456",
      },
    ];

    useAuth.mockReturnValue({
      user: mockUser,
      contacts: mockContacts,
      logout: mockLogout,
      deleteContact: mockDeleteContact,
    });

    render(<ContactList />);

    const deleteButton = screen.getByRole("button", { name: /Supprimer/i });
    await userEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith("Supprimer ce contact ?");
    expect(mockDeleteContact).toHaveBeenCalledWith("1");
  });

  it("ne devrait pas supprimer si l'utilisateur annule", async () => {
    global.confirm.mockReturnValue(false);

    const mockContacts = [
      {
        _id: "1",
        firstName: "Jean",
        lastName: "Dupont",
        phone: "123456",
      },
    ];

    useAuth.mockReturnValue({
      user: mockUser,
      contacts: mockContacts,
      logout: mockLogout,
      deleteContact: mockDeleteContact,
    });

    render(<ContactList />);

    const deleteButton = screen.getByRole("button", { name: /Supprimer/i });
    await userEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockDeleteContact).not.toHaveBeenCalled();
  });

  it("ne devrait afficher que les champs non vides", () => {
    const mockContacts = [
      {
        _id: "1",
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33 6 12 34 56 78",
        // Pas d'email ni d'adresse
      },
    ];

    useAuth.mockReturnValue({
      user: mockUser,
      contacts: mockContacts,
      logout: mockLogout,
      deleteContact: mockDeleteContact,
    });

    render(<ContactList />);

    expect(screen.getByText(/\+33 6 12 34 56 78/i)).toBeInTheDocument();
    // Les icônes email et adresse ne devraient pas être présentes
    const contactDetails = screen.getByText(/\+33 6 12 34 56 78/i);
    expect(contactDetails.textContent).not.toContain("📧");
    expect(contactDetails.textContent).not.toContain("📍");
  });
});
