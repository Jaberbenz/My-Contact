import { verifyToken } from "../services/authService.js";
import User from "../models/User.js";

/**
 * Middleware pour protéger les routes privées
 * Vérifie le token JWT dans le header Authorization
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Accès refusé. Token manquant.",
      });
    }

    // Extraire le token (enlever "Bearer ")
    const token = authHeader.substring(7);

    // Vérifier et décoder le token
    const decoded = verifyToken(token);

    // Récupérer l'utilisateur depuis la base
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur introuvable. Accès refusé.",
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user.toJSON();
    req.userId = user._id;

    next();
  } catch (error) {
    console.error("Erreur requireAuth:", error);
    res.status(401).json({
      success: false,
      message: "Token invalide ou expiré. Accès refusé.",
    });
  }
};

/**
 * Middleware optionnel pour récupérer l'utilisateur si connecté
 * Ne bloque pas la requête si pas de token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);

      if (user) {
        req.user = user.toJSON();
        req.userId = user._id;
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur
    next();
  }
};
