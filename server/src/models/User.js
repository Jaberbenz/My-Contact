import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email Obligatoire"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "veuillez entrer une adresse email valide",
    ],
  },
  password: {
    type: String,
    required: [true, "Mot de passe Obligatoire"],
    minLength: [6, "Mot de passe trop court minimum 6 caractere"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    // generation d'un nombre aleatoire salt pour l'ajouter avec le mdp avant le hash
    const salt = await bcrypt.genSalt(10);
    // hash du mdp avec le salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// methode de comparaison de mdp

userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

// methode de suppression de mdp lors de la reconversion en json automatiquement pour ne pas afficher le mdp dans la reponse
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model("User", userSchema);

export default User;
