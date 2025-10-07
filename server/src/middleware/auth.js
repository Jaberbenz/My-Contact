import User from "../models/User.js";
import { verifyToken } from "../services/authService.js";

export const requireAuth = async (req, res, next) => {
  console.log("🔐 [AUTH MIDDLEWARE] Vérification du token...");
  console.log(
    "🔐 [AUTH MIDDLEWARE] Headers:",
    req.headers.authorization ? "Token présent" : "Token absent"
  );

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ [AUTH MIDDLEWARE] Token manquant ou format invalide");
      return res.status(401).json({
        success: false,
        message: "Accès refusé. Token manquant.",
      });
    }

    const token = authHeader.substring(7);
    console.log(
      "🔐 [AUTH MIDDLEWARE] Token extrait (premiers 20 car):",
      token.substring(0, 20) + "..."
    );

    const decoded = verifyToken(token);
    console.log("🔐 [AUTH MIDDLEWARE] Token décodé, userId:", decoded.userId);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log(
        "❌ [AUTH MIDDLEWARE] Utilisateur introuvable pour ID:",
        decoded.userId
      );
      return res.status(401).json({
        success: false,
        message: "Utilisateur introuvable. Accès refusé.",
      });
    }

    req.user = user.toJSON();
    req.userId = user._id;
    console.log(
      "✅ [AUTH MIDDLEWARE] Authentification réussie pour:",
      user.email
    );

    next();
  } catch (error) {
    console.error("❌ [AUTH MIDDLEWARE] Erreur:", error.message);
    res.status(401).json({
      success: false,
      message: "Token invalide ou expiré. Accès refusé.",
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  console.log("🔓 [OPTIONAL AUTH] Vérification optionnelle...");

  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);

      if (user) {
        req.user = user.toJSON();
        req.userId = user._id;
        console.log("✅ [OPTIONAL AUTH] Utilisateur authentifié:", user.email);
      }
    } else {
      console.log("ℹ️ [OPTIONAL AUTH] Aucun token, continuation sans auth");
    }

    next();
  } catch (error) {
    console.log("⚠️ [OPTIONAL AUTH] Erreur ignorée:", error.message);
    next();
  }
};
