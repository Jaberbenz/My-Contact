import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("token pas valide");
  }
};

export const createUserWithToken = async (userData) => {
  console.log(
    "🔧 [AUTH SERVICE] createUserWithToken - userData:",
    userData.email
  );
  const user = new User(userData);
  await user.save();
  const token = generateToken(user._id);
  console.log("✅ [AUTH SERVICE] User créé et token généré");

  return {
    user: user.toJSON(),
    token,
  };
};

export const authenticateUser = async (email, password) => {
  console.log("🔧 [AUTH SERVICE] authenticateUser - email:", email);

  try {
    console.log("🔍 [AUTH SERVICE] Recherche de l'utilisateur...");
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ [AUTH SERVICE] Utilisateur non trouvé");
      throw Error("Email ou mot de passe invalide");
    }

    console.log(
      "✅ [AUTH SERVICE] Utilisateur trouvé, vérification du password..."
    );
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      console.log("❌ [AUTH SERVICE] Password invalide");
      throw Error("Email ou mot de passe incorrect");
    }

    console.log("✅ [AUTH SERVICE] Password valide, génération du token...");
    const token = generateToken(user._id);
    console.log("✅ [AUTH SERVICE] Token généré");

    return {
      user: user.toJSON(),
      token,
    };
  } catch (error) {
    console.error("❌ [AUTH SERVICE] Erreur:", error.message);
    throw error;
  }
};
