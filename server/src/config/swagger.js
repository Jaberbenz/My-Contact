import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Contact App API",
      version: "1.0.0",
      description: "API de gestion de contacts avec authentification JWT",
      contact: {
        name: "API Support",
        email: "support@contactapp.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Serveur de développement",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Entrez votre token JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "ID de l'utilisateur",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email de l'utilisateur",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Date de création",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Date de mise à jour",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              description: "Message d'erreur",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              description: "Message de succès",
            },
            data: {
              type: "object",
              description: "Données retournées",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description: "Endpoints d'authentification",
      },
      {
        name: "Contacts",
        description: "Endpoints de gestion des contacts",
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Chemin vers vos fichiers de routes
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
