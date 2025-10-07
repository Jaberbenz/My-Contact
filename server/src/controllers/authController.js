import { validationResult } from "express-validator";
import User from "../models/User.js";
import {
  createUserWithToken,
  authenticateUser,
} from "../services/authService.js";

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  console.log("📝 [REGISTER] Nouvelle demande d'inscription");
  console.log("📝 [REGISTER] Body reçu:", req.body);

  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ [REGISTER] Erreurs de validation:", errors.array());
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    console.log("📝 [REGISTER] Email:", email);

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ [REGISTER] Email déjà utilisé:", email);
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé",
      });
    }

    console.log("✅ [REGISTER] Création de l'utilisateur...");
    // Créer l'utilisateur avec token
    const result = await createUserWithToken({ email, password });
    console.log(
      "✅ [REGISTER] Utilisateur créé avec succès, ID:",
      result.user._id
    );

    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      data: result,
    });
  } catch (error) {
    console.error("❌ [REGISTER] Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'inscription",
      error: error.message,
    });
  }
};

/**
 * @desc    Connexion utilisateur
 * @route   POST /auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  console.log("🔐 [LOGIN] Nouvelle demande de connexion");
  console.log("🔐 [LOGIN] Body reçu:", req.body);

  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ [LOGIN] Erreurs de validation:", errors.array());
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    console.log("🔐 [LOGIN] Tentative de connexion pour:", email);

    // Authentifier l'utilisateur
    const result = await authenticateUser(email, password);
    console.log("✅ [LOGIN] Connexion réussie pour:", email);

    res.json({
      success: true,
      message: "Connexion réussie",
      data: result,
    });
  } catch (error) {
    console.error("❌ [LOGIN] Erreur:", error.message);
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Obtenir le profil utilisateur connecté
 * @route   GET /auth/profile
 * @access  Private (requireAuth)
 */
export const getProfile = async (req, res) => {
  console.log("👤 [PROFILE] Demande de profil pour user ID:", req.userId);

  try {
    res.json({
      success: true,
      message: "Profil récupéré avec succès",
      data: {
        user: req.user,
      },
    });
    console.log("✅ [PROFILE] Profil envoyé pour:", req.user.email);
  } catch (error) {
    console.error("❌ [PROFILE] Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

/**
 * @desc    Vérifier si un token est valide
 * @route   GET /auth/verify
 * @access  Private (requireAuth)
 */
export const verifyToken = async (req, res) => {
  console.log("🔑 [VERIFY] Vérification du token pour user ID:", req.userId);

  try {
    res.json({
      success: true,
      message: "Token valide",
      data: {
        userId: req.userId,
        user: req.user,
      },
    });
    console.log("✅ [VERIFY] Token valide pour:", req.user.email);
  } catch (error) {
    console.error("❌ [VERIFY] Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};
