import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Le prénom est obligatoire"],
      trim: true,
      minLength: [2, "Le prénom doit contenir au moins 2 caractères"],
      maxLength: [50, "Le prénom ne peut pas dépasser 50 caractères"],
    },
    lastName: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
      minLength: [2, "Le nom doit contenir au moins 2 caractères"],
      maxLength: [50, "Le nom ne peut pas dépasser 50 caractères"],
    },
    phone: {
      type: String,
      required: [true, "Le numéro de téléphone est obligatoire"],
      trim: true,
      validate: {
        validator: function (v) {
          // Validation : 10 à 20 caractères (chiffres, espaces, +, -, ())
          return /^[\d\s+\-()]{10,20}$/.test(v);
        },
        message:
          "Le numéro de téléphone doit contenir entre 10 et 20 caractères",
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Veuillez entrer une adresse email valide",
      ],
    },
    address: {
      type: String,
      trim: true,
      maxLength: [200, "L'adresse ne peut pas dépasser 200 caractères"],
    },
    // Référence à l'utilisateur propriétaire
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'utilisateur est obligatoire"],
      index: true,
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

// Index composé pour recherche rapide par utilisateur
contactSchema.index({ userId: 1, lastName: 1, firstName: 1 });

// Méthode pour obtenir le nom complet
contactSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

// Méthode virtuelle pour le nom complet
contactSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// S'assurer que les virtuels sont inclus lors de la conversion JSON
contactSchema.set("toJSON", { virtuals: true });
contactSchema.set("toObject", { virtuals: true });

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
