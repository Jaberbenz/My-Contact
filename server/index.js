import express from "express";
import cors from "cors";
import connectDB from "./src/config/database.js";
import authRoutes from "./src/routes/auth.js";
import contactRoutes from "./src/routes/contact.js";
import { swaggerUi, swaggerSpec } from "./src/config/swagger.js";
import { errorHandler, notFound } from "./src/middleware/errorHandler.js";

// Connexion à la base de données
connectDB();

const app = express();
const port = process.env.PORT || 3000;

// ========== MIDDLEWARES ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== ROUTES ==========
// Route racine
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Contact App API is running!",
    version: "1.0.0",
    endpoints: {
      swagger: "/api-docs",
      auth: "/auth",
      contacts: "/contacts",
    },
  });
});

// Routes d'authentification
app.use("/auth", authRoutes);

// Routes de contacts
app.use("/contacts", contactRoutes);

// Documentation Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Contact App API Documentation",
  })
);

// ========== GESTION DES ERREURS ==========
// Routes non trouvées (404)
app.use(notFound);

// Gestion d'erreurs globale
app.use(errorHandler);

// ========== DÉMARRAGE DU SERVEUR ==========
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  console.log(`🔐 Auth endpoints: http://localhost:${port}/auth`);
  console.log(`📇 Contact endpoints: http://localhost:${port}/contacts`);
});
