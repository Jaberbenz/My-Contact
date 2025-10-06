import express from "express";
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  deleteAllContacts,
} from "../controllers/contactController.js";
import { requireAuth } from "../middleware/auth.js";
import {
  validateCreateContact,
  validateUpdateContact,
} from "../middleware/validation.js";

const router = express.Router();

// Toutes les routes sont protégées
router.use(requireAuth);

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Obtenir tous les contacts de l'utilisateur
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par nom ou téléphone
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: lastName
 *         description: Champ de tri (firstName, lastName, createdAt)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Liste des contacts
 *       401:
 *         description: Non autorisé
 */
router.get("/", getContacts);

/**
 * @swagger
 * /contacts/{id}:
 *   get:
 *     summary: Obtenir un contact par son ID
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact trouvé
 *       404:
 *         description: Contact introuvable
 */
router.get("/:id", getContactById);

/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Créer un nouveau contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phone
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jean
 *               lastName:
 *                 type: string
 *                 example: Dupont
 *               phone:
 *                 type: string
 *                 example: +33612345678
 *               email:
 *                 type: string
 *                 example: jean.dupont@example.com
 *               address:
 *                 type: string
 *                 example: 123 Rue de Paris, 75001 Paris
 *     responses:
 *       201:
 *         description: Contact créé
 *       400:
 *         description: Données invalides
 */
router.post("/", validateCreateContact, createContact);

/**
 * @swagger
 * /contacts/{id}:
 *   patch:
 *     summary: Mettre à jour un contact (partiel)
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact mis à jour
 *       404:
 *         description: Contact introuvable
 */
router.patch("/:id", validateUpdateContact, updateContact);

/**
 * @swagger
 * /contacts/{id}:
 *   delete:
 *     summary: Supprimer un contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact supprimé
 *       404:
 *         description: Contact introuvable
 */
router.delete("/:id", deleteContact);

/**
 * @swagger
 * /contacts:
 *   delete:
 *     summary: Supprimer tous les contacts de l'utilisateur
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contacts supprimés
 */
router.delete("/", deleteAllContacts);

export default router;
