import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { useAuth } from "./context/AuthContext";

jest.mock("./context/AuthContext");
jest.mock("./components/Login", () => {
  return function MockLogin({ onSwitchToRegister }) {
    return (
      <div data-testid="login-component">
        <button onClick={onSwitchToRegister}>Switch to Register</button>
      </div>
    );
  };
});
jest.mock("./components/Register", () => {
  return function MockRegister({ onSwitchToLogin }) {
    return (
      <div data-testid="register-component">
        <button onClick={onSwitchToLogin}>Switch to Login</button>
      </div>
    );
  };
});
jest.mock("./components/ContactList", () => {
  return function MockContactList() {
    return <div data-testid="contactlist-component">Contact List</div>;
  };
});

describe("App Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait afficher le chargement pendant l'initialisation", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(<App />);

    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
  });

  it("devrait afficher Login si l'utilisateur n'est pas connecté", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(<App />);

    expect(screen.getByTestId("login-component")).toBeInTheDocument();
    expect(screen.queryByTestId("register-component")).not.toBeInTheDocument();
  });

  it("devrait afficher ContactList si l'utilisateur est connecté", () => {
    useAuth.mockReturnValue({
      user: { _id: "123", email: "test@example.com" },
      loading: false,
    });

    render(<App />);

    expect(screen.getByTestId("contactlist-component")).toBeInTheDocument();
    expect(screen.queryByTestId("login-component")).not.toBeInTheDocument();
  });

  it("devrait basculer vers Register", async () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(<App />);

    expect(screen.getByTestId("login-component")).toBeInTheDocument();

    const switchButton = screen.getByRole("button", {
      name: /Switch to Register/i,
    });
    await userEvent.click(switchButton);

    expect(screen.getByTestId("register-component")).toBeInTheDocument();
    expect(screen.queryByTestId("login-component")).not.toBeInTheDocument();
  });

  it("devrait basculer vers Login depuis Register", async () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(<App />);

    // Basculer vers Register
    const switchToRegisterButton = screen.getByRole("button", {
      name: /Switch to Register/i,
    });
    await userEvent.click(switchToRegisterButton);

    expect(screen.getByTestId("register-component")).toBeInTheDocument();

    // Basculer retour vers Login
    const switchToLoginButton = screen.getByRole("button", {
      name: /Switch to Login/i,
    });
    await userEvent.click(switchToLoginButton);

    expect(screen.getByTestId("login-component")).toBeInTheDocument();
    expect(screen.queryByTestId("register-component")).not.toBeInTheDocument();
  });

  it("devrait gérer le changement d'état utilisateur", () => {
    const { rerender } = render(<App />);

    // Premier rendu: pas connecté
    useAuth.mockReturnValue({
      user: null,
      loading: false,
    });
    rerender(<App />);
    expect(screen.getByTestId("login-component")).toBeInTheDocument();

    // Deuxième rendu: connecté
    useAuth.mockReturnValue({
      user: { _id: "123", email: "test@example.com" },
      loading: false,
    });
    rerender(<App />);
    expect(screen.getByTestId("contactlist-component")).toBeInTheDocument();

    // Troisième rendu: déconnecté
    useAuth.mockReturnValue({
      user: null,
      loading: false,
    });
    rerender(<App />);
    expect(screen.getByTestId("login-component")).toBeInTheDocument();
  });
});
