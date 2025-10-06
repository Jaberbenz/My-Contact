import { body } from "express-validator";

/**
 * Validation pour l'inscription
 */
export const validateRegister = [
  body("email")
    .isEmail()
    .withMessage("Veuillez entrer un email valide")
    .normalizeEmail()
    .trim(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
];

/**
 * Validation pour la connexion
 */
export const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Veuillez entrer un email valide")
    .normalizeEmail()
    .trim(),

  body("password").notEmpty().withMessage("Le mot de passe est requis"),
];

/**
 * Validation pour la création de contact
 */

export const validateCreateContact = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("Le prénom est obligatoire")
    .isLength({ min: 2, max: 50 })
    .withMessage("Le prénom doit contenir entre 2 et 50 caractères"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Le nom est obligatoire")
    .isLength({ min: 2, max: 50 })
    .withMessage("Le nom doit contenir entre 2 et 50 caractères"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Le numéro de téléphone est obligatoire")
    .matches(/^[\d\s+\-()]{10,20}$/)
    .withMessage(
      "Le numéro de téléphone doit contenir entre 10 et 20 caractères"
    ),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Veuillez entrer un email valide")
    .normalizeEmail(),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("L'adresse ne peut pas dépasser 200 caractères"),
];

/**
 * Validation pour la mise à jour de contact (champs optionnels)
 */
export const validateUpdateContact = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Le prénom doit contenir entre 2 et 50 caractères"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Le nom doit contenir entre 2 et 50 caractères"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[\d\s+\-()]{10,20}$/)
    .withMessage(
      "Le numéro de téléphone doit contenir entre 10 et 20 caractères"
    ),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Veuillez entrer un email valide")
    .normalizeEmail(),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("L'adresse ne peut pas dépasser 200 caractères"),
];
