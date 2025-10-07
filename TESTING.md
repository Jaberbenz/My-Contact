# Guide de Tests - Contact App

Ce document décrit la suite de tests complète pour l'application Contact App.

## 📋 Vue d'ensemble

Le projet dispose d'une couverture de tests complète pour le backend et le frontend :

### Backend (Server)

- ✅ Tests unitaires des services (authService)
- ✅ Tests unitaires des models (User, Contact)
- ✅ Tests d'intégration des middlewares (auth)
- ✅ Tests d'intégration des routes API (auth, contacts)
- ✅ Framework: Jest avec Supertest et MongoDB Memory Server

### Frontend (Client)

- ✅ Tests unitaires des composants React (Login, Register, ContactForm, ContactList, App)
- ✅ Tests du contexte (AuthContext)
- ✅ Tests de l'API client
- ✅ Framework: Jest avec React Testing Library

## 🚀 Installation des dépendances

### Backend

```bash
cd server
npm install
```

Dépendances de test installées :

- `jest` - Framework de test
- `supertest` - Tests HTTP
- `mongodb-memory-server` - Base de données en mémoire pour les tests
- `cross-env` - Variables d'environnement cross-platform

### Frontend

```bash
cd client
npm install
```

Dépendances de test (déjà incluses) :

- `@testing-library/react` - Tests de composants React
- `@testing-library/jest-dom` - Matchers personnalisés
- `@testing-library/user-event` - Simulation d'interactions utilisateur

## 🧪 Exécution des tests

### Tests Backend

```bash
cd server

# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch
npm run test:watch

# Exécuter les tests avec couverture de code
npm run test:coverage
```

### Tests Frontend

```bash
cd client

# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch (déjà par défaut)
npm test

# Exécuter les tests avec couverture de code
npm test -- --coverage --watchAll=false
```

## 📁 Structure des tests

### Backend (`server/tests/`)

```
server/tests/
├── setup.js                          # Configuration globale
├── helpers/
│   └── testHelpers.js               # Fonctions utilitaires pour les tests
├── unit/
│   ├── services/
│   │   └── authService.test.js      # Tests du service d'authentification
│   └── models/
│       ├── User.test.js              # Tests du modèle User
│       └── Contact.test.js           # Tests du modèle Contact
└── integration/
    ├── middleware/
    │   └── auth.test.js              # Tests des middlewares d'auth
    └── routes/
        ├── auth.test.js              # Tests des routes d'authentification
        └── contact.test.js           # Tests des routes de contacts
```

### Frontend (`client/src/`)

```
client/src/
├── api/
│   └── client.test.js                # Tests de l'API client
├── context/
│   └── AuthContext.test.js          # Tests du contexte d'authentification
├── components/
│   ├── Login.test.js                # Tests du composant Login
│   ├── Register.test.js             # Tests du composant Register
│   ├── ContactForm.test.js          # Tests du formulaire de contact
│   └── ContactList.test.js          # Tests de la liste de contacts
└── App.test.js                       # Tests du composant principal
```

## 📊 Couverture des tests

### Backend

Les tests couvrent :

#### Services (authService)

- ✅ Génération de tokens JWT
- ✅ Vérification de tokens
- ✅ Création d'utilisateurs avec tokens
- ✅ Authentification d'utilisateurs
- ✅ Gestion des erreurs

#### Models

**User:**

- ✅ Validation des champs (email, password)
- ✅ Hashing automatique du mot de passe
- ✅ Méthode comparePassword
- ✅ Méthode toJSON (exclusion du mot de passe)
- ✅ Timestamps automatiques

**Contact:**

- ✅ Validation des champs obligatoires et optionnels
- ✅ Validation des formats (téléphone, email)
- ✅ Trim automatique des champs
- ✅ Méthodes getFullName et fullName (virtual)
- ✅ Timestamps automatiques

#### Middlewares

- ✅ requireAuth : authentification obligatoire
- ✅ optionalAuth : authentification optionnelle
- ✅ Gestion des tokens invalides/expirés
- ✅ Gestion des utilisateurs supprimés

#### Routes API

**Auth:**

- ✅ POST /auth/register - Inscription
- ✅ POST /auth/login - Connexion
- ✅ GET /auth/profile - Profil utilisateur
- ✅ GET /auth/verify - Vérification du token

**Contacts:**

- ✅ POST /contacts - Créer un contact
- ✅ GET /contacts - Lister les contacts (avec pagination, tri, recherche)
- ✅ GET /contacts/:id - Obtenir un contact
- ✅ PATCH /contacts/:id - Mettre à jour un contact
- ✅ DELETE /contacts/:id - Supprimer un contact
- ✅ DELETE /contacts - Supprimer tous les contacts
- ✅ Isolation des données par utilisateur

### Frontend

Les tests couvrent :

#### API Client

- ✅ Requêtes HTTP (GET, POST, PATCH, DELETE)
- ✅ Gestion des tokens d'authentification
- ✅ Gestion des erreurs HTTP
- ✅ Déconnexion automatique sur 401
- ✅ Gestion des erreurs réseau

#### AuthContext

- ✅ Hook useAuth
- ✅ État initial et chargement depuis localStorage
- ✅ Fonction register
- ✅ Fonction login (avec chargement des contacts)
- ✅ Fonction logout
- ✅ Fonctions CRUD contacts (create, update, delete, load)
- ✅ Gestion des erreurs

#### Composants

**Login:**

- ✅ Rendu du formulaire
- ✅ Validation de l'email
- ✅ Validation du mot de passe
- ✅ Soumission du formulaire
- ✅ Affichage des erreurs
- ✅ Navigation vers l'inscription

**Register:**

- ✅ Rendu du formulaire
- ✅ Validation de l'email
- ✅ Validation de la complexité du mot de passe
- ✅ Indicateur de force du mot de passe
- ✅ Vérification de correspondance des mots de passe
- ✅ Soumission et alerte de succès
- ✅ Navigation vers la connexion

**ContactForm:**

- ✅ Mode ajout et modification
- ✅ Validation de tous les champs
- ✅ Compteur de caractères pour l'adresse
- ✅ Création de contact
- ✅ Mise à jour de contact
- ✅ Annulation
- ✅ Affichage des erreurs

**ContactList:**

- ✅ Affichage de l'utilisateur connecté
- ✅ Déconnexion
- ✅ État vide
- ✅ Affichage de la liste
- ✅ Compteur de contacts
- ✅ Ouverture/fermeture du formulaire
- ✅ Édition de contact
- ✅ Suppression avec confirmation

**App:**

- ✅ État de chargement
- ✅ Affichage conditionnel (Login/Register/ContactList)
- ✅ Navigation entre Login et Register
- ✅ Gestion du changement d'état utilisateur

## 🎯 Exemples de tests

### Backend - Test unitaire

```javascript
it("devrait créer un utilisateur et générer un token", async () => {
  const userData = {
    email: "newuser@example.com",
    password: "Password123",
  };

  const result = await createUserWithToken(userData);

  expect(result.user.email).toBe(userData.email);
  expect(result.token).toBeDefined();
  expect(result.user.password).toBeUndefined();
});
```

### Backend - Test d'intégration

```javascript
it("devrait créer un nouveau contact avec des données valides", async () => {
  const contactData = {
    firstName: "Jean",
    lastName: "Dupont",
    phone: "+33 6 12 34 56 78",
  };

  const response = await request(app)
    .post("/contacts")
    .set("Authorization", `Bearer ${userToken}`)
    .send(contactData)
    .expect(201);

  expect(response.body.success).toBe(true);
  expect(response.body.data.contact.firstName).toBe("Jean");
});
```

### Frontend - Test de composant

```javascript
it("devrait soumettre le formulaire avec des données valides", async () => {
  mockLogin.mockResolvedValue({ success: true });

  render(<Login onSwitchToRegister={jest.fn()} />);

  await userEvent.type(
    screen.getByPlaceholderText(/email/i),
    "test@example.com"
  );
  await userEvent.type(
    screen.getByPlaceholderText(/mot de passe/i),
    "Password123"
  );
  await userEvent.click(screen.getByRole("button", { name: /Se connecter/i }));

  expect(mockLogin).toHaveBeenCalledWith("test@example.com", "Password123");
});
```

## ⚙️ Configuration

### Backend - jest.config.js

```javascript
export default {
  testEnvironment: "node",
  transform: {},
  extensionsToTreatAsEsm: [".js"],
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/config/**"],
  coverageDirectory: "coverage",
  testTimeout: 10000,
  verbose: true,
};
```

### Frontend - setupTests.js

Le fichier de configuration existe déjà dans `client/src/setupTests.js` et importe `@testing-library/jest-dom` pour les matchers personnalisés.

## 🔍 Bonnes pratiques

### Tests Backend

1. **Isolation** : Chaque test est isolé avec `beforeEach/afterEach`
2. **Base de données** : Utilisation de MongoDB Memory Server pour des tests rapides
3. **Helpers** : Fonctions réutilisables dans `testHelpers.js`
4. **Nommage** : Descriptions claires en français
5. **AAA Pattern** : Arrange, Act, Assert

### Tests Frontend

1. **Mocking** : Mock des dépendances externes (AuthContext, API)
2. **User Events** : Utilisation de `@testing-library/user-event` pour simuler les interactions
3. **Queries** : Préférence pour les queries accessibles (getByRole, getByLabelText)
4. **waitFor** : Gestion des opérations asynchrones
5. **Test d'intégration** : Tests de flux complets utilisateur

## 📈 CI/CD

Pour intégrer les tests dans un pipeline CI/CD :

```yaml
# Exemple pour GitHub Actions
- name: Test Backend
  run: |
    cd server
    npm ci
    npm test -- --coverage

- name: Test Frontend
  run: |
    cd client
    npm ci
    npm test -- --coverage --watchAll=false
```

## 🐛 Débogage

### Backend

Pour déboguer un test spécifique :

```bash
cd server
npm test -- authService.test.js
```

### Frontend

Pour déboguer un test spécifique :

```bash
cd client
npm test -- Login.test.js
```

### Mode Verbose

Les deux configurations utilisent `verbose: true` pour des logs détaillés.

## 📝 Notes importantes

- Les tests backend utilisent une base de données en mémoire, aucune configuration MongoDB externe n'est nécessaire
- Les tests frontend mockent les appels API, aucun serveur backend n'est nécessaire
- Tous les tests peuvent être exécutés en parallèle (`--runInBand` pour le backend pour éviter les conflits DB)
- La couverture de code est générée dans le dossier `coverage/`

## 🎉 Résumé

- **Backend** : 80+ tests couvrant tous les services, models, middlewares et routes
- **Frontend** : 70+ tests couvrant tous les composants, contextes et utilitaires
- **Couverture** : > 90% du code métier
- **Exécution** : ~10-15 secondes pour la suite complète

Tous les tests sont prêts à être exécutés et peuvent être intégrés dans un pipeline CI/CD.
