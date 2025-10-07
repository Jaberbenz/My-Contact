/**
 * Middleware de gestion d'erreurs globale
 * Format JSON uniforme pour toutes les erreurs
 */
export const errorHandler = (error, req, res, next) => {
  console.error("❌ Erreur:", error);

  // Erreur de validation Mongoose
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Erreur de validation",
      errors,
    });
  }

  // Erreur de cast (ID invalide)
  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "ID invalide",
      error: error.message,
    });
  }

  // Erreur de duplication (clé unique)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `Ce ${field} est déjà utilisé`,
    });
  }

  // Erreur JWT
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token invalide",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expiré",
    });
  }

  // Erreur générique
  const statusCode = error.statusCode || error.status || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Erreur serveur interne",
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
      error: error,
    }),
  });
};

/**
 * Middleware pour les routes non trouvées (404)
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route introuvable",
    path: req.originalUrl,
    method: req.method,
  });
};
