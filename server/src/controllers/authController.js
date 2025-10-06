import { create}import { createUserWithToken, authenticateUser } from '../services/authService.js';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Créer l'utilisateur avec token
    const result = await createUserWithToken({ email, password });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: result
    });

  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription',
      error: error.message
    });
  }
};

/**
 * @desc    Connexion utilisateur
 * @route   POST /auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Authentifier l'utilisateur
    const result = await authenticateUser(email, password);

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: result
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Obtenir le profil utilisateur connecté
 * @route   GET /auth/profile
 * @access  Private (requireAuth)
 */
export const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Profil récupéré avec succès',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * @desc    Vérifier si un token est valide
 * @route   GET /auth/verify
 * @access  Private (requireAuth)
 */
export const verifyToken = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token valide',
      data: {
        userId: req.userId,
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};