import { validationResult } from "express-validator";
import Contact from "../models/Contact.js";

/**
 * @desc    Obtenir tous les contacts de l'utilisateur connecté
 * @route   GET /contacts
 * @access  Private
 */
export const getContacts = async (req, res, next) => {
  console.log("📇 [GET CONTACTS] User ID:", req.userId);
  console.log("📇 [GET CONTACTS] Query params:", req.query);

  try {
    const {
      search,
      sort = "lastName",
      order = "asc",
      page = 1,
      limit = 10,
    } = req.query;

    const query = { userId: req.userId };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
      console.log("🔍 [GET CONTACTS] Recherche:", search);
    }

    const sortOrder = order === "desc" ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };
    const skip = (page - 1) * limit;

    const contacts = await Contact.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Contact.countDocuments(query);

    console.log("✅ [GET CONTACTS] Trouvés:", contacts.length, "/", total);

    res.json({
      success: true,
      message: "Contacts récupérés avec succès",
      data: {
        contacts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ [GET CONTACTS] Erreur:", error);
    next(error);
  }
};

/**
 * @desc    Obtenir un contact par son ID
 * @route   GET /contacts/:id
 * @access  Private
 */
export const getContactById = async (req, res, next) => {
  console.log("📇 [GET CONTACT] ID:", req.params.id, "User:", req.userId);

  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!contact) {
      console.log("❌ [GET CONTACT] Contact introuvable");
      return res.status(404).json({
        success: false,
        message: "Contact introuvable",
      });
    }

    console.log(
      "✅ [GET CONTACT] Contact trouvé:",
      contact.firstName,
      contact.lastName
    );
    res.json({
      success: true,
      message: "Contact récupéré avec succès",
      data: { contact },
    });
  } catch (error) {
    console.error("❌ [GET CONTACT] Erreur:", error);
    next(error);
  }
};

/**
 * @desc    Créer un nouveau contact
 * @route   POST /contacts
 * @access  Private
 */
export const createContact = async (req, res, next) => {
  console.log("➕ [CREATE CONTACT] User ID:", req.userId);
  console.log("➕ [CREATE CONTACT] Body:", req.body);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ [CREATE CONTACT] Erreurs de validation:", errors.array());
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, phone, email, address } = req.body;

    const contact = new Contact({
      firstName,
      lastName,
      phone,
      email,
      address,
      userId: req.userId,
    });

    await contact.save();
    console.log("✅ [CREATE CONTACT] Contact créé:", contact._id);

    res.status(201).json({
      success: true,
      message: "Contact créé avec succès",
      data: { contact },
    });
  } catch (error) {
    console.error("❌ [CREATE CONTACT] Erreur:", error);
    next(error);
  }
};

/**
 * @desc    Mettre à jour un contact
 * @route   PATCH /contacts/:id
 * @access  Private
 */
export const updateContact = async (req, res, next) => {
  console.log("✏️ [UPDATE CONTACT] ID:", req.params.id);
  console.log("✏️ [UPDATE CONTACT] Body:", req.body);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ [UPDATE CONTACT] Erreurs de validation:", errors.array());
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, phone, email, address } = req.body;

    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!contact) {
      console.log("❌ [UPDATE CONTACT] Contact introuvable");
      return res.status(404).json({
        success: false,
        message: "Contact introuvable",
      });
    }

    if (firstName !== undefined) contact.firstName = firstName;
    if (lastName !== undefined) contact.lastName = lastName;
    if (phone !== undefined) contact.phone = phone;
    if (email !== undefined) contact.email = email;
    if (address !== undefined) contact.address = address;

    await contact.save();
    console.log("✅ [UPDATE CONTACT] Contact mis à jour:", contact._id);

    res.json({
      success: true,
      message: "Contact mis à jour avec succès",
      data: { contact },
    });
  } catch (error) {
    console.error("❌ [UPDATE CONTACT] Erreur:", error);
    next(error);
  }
};

/**
 * @desc    Supprimer un contact
 * @route   DELETE /contacts/:id
 * @access  Private
 */
export const deleteContact = async (req, res, next) => {
  console.log("🗑️ [DELETE CONTACT] ID:", req.params.id);

  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!contact) {
      console.log("❌ [DELETE CONTACT] Contact introuvable");
      return res.status(404).json({
        success: false,
        message: "Contact introuvable",
      });
    }

    console.log("✅ [DELETE CONTACT] Contact supprimé:", contact._id);
    res.json({
      success: true,
      message: "Contact supprimé avec succès",
      data: { contact },
    });
  } catch (error) {
    console.error("❌ [DELETE CONTACT] Erreur:", error);
    next(error);
  }
};

/**
 * @desc    Supprimer tous les contacts
 * @route   DELETE /contacts
 * @access  Private
 */
export const deleteAllContacts = async (req, res, next) => {
  console.log("🗑️ [DELETE ALL] User ID:", req.userId);

  try {
    const result = await Contact.deleteMany({ userId: req.userId });
    console.log("✅ [DELETE ALL] Contacts supprimés:", result.deletedCount);

    res.json({
      success: true,
      message: `${result.deletedCount} contact(s) supprimé(s)`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    console.error("❌ [DELETE ALL] Erreur:", error);
    next(error);
  }
};
