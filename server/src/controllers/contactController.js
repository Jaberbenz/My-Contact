import Contact from "../models/Contact.js";
import { validationResult } from "express-validator";

/**
 * @desc    Obtenir tous les contacts de l'utilisateur connecté
 * @route   GET /contacts
 * @access  Private
 */
export const getContacts = async (req, res, next) => {
  try {
    const {
      search,
      sort = "lastName",
      order = "asc",
      page = 1,
      limit = 10,
    } = req.query;

    // Construction de la requête
    const query = { userId: req.userId };

    // Recherche par nom ou téléphone
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Tri
    const sortOrder = order === "desc" ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };

    // Pagination
    const skip = (page - 1) * limit;

    // Exécution de la requête
    const contacts = await Contact.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    // Compter le total
    const total = await Contact.countDocuments(query);

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
    next(error);
  }
};

/**
 * @desc    Obtenir un contact par son ID
 * @route   GET /contacts/:id
 * @access  Private
 */
export const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact introuvable",
      });
    }

    res.json({
      success: true,
      message: "Contact récupéré avec succès",
      data: { contact },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Créer un nouveau contact
 * @route   POST /contacts
 * @access  Private
 */
export const createContact = async (req, res, next) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, phone, email, address } = req.body;

    // Créer le contact avec l'ID de l'utilisateur
    const contact = new Contact({
      firstName,
      lastName,
      phone,
      email,
      address,
      userId: req.userId,
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: "Contact créé avec succès",
      data: { contact },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mettre à jour un contact (PATCH - mise à jour partielle)
 * @route   PATCH /contacts/:id
 * @access  Private
 */
export const updateContact = async (req, res, next) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, phone, email, address } = req.body;

    // Trouver le contact
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact introuvable",
      });
    }

    // Mettre à jour uniquement les champs fournis
    if (firstName !== undefined) contact.firstName = firstName;
    if (lastName !== undefined) contact.lastName = lastName;
    if (phone !== undefined) contact.phone = phone;
    if (email !== undefined) contact.email = email;
    if (address !== undefined) contact.address = address;

    await contact.save();

    res.json({
      success: true,
      message: "Contact mis à jour avec succès",
      data: { contact },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Supprimer un contact
 * @route   DELETE /contacts/:id
 * @access  Private
 */
export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact introuvable",
      });
    }

    res.json({
      success: true,
      message: "Contact supprimé avec succès",
      data: { contact },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Supprimer tous les contacts de l'utilisateur
 * @route   DELETE /contacts
 * @access  Private
 */
export const deleteAllContacts = async (req, res, next) => {
  try {
    const result = await Contact.deleteMany({ userId: req.userId });

    res.json({
      success: true,
      message: `${result.deletedCount} contact(s) supprimé(s)`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    next(error);
  }
};
