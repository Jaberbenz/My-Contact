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
  const user = new User(userData);
  await user.save();
  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token,
  };
};

export const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw Error("Email ou mot de passe invalide");
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw Error("Email ou mot de passe incorrect");
  }

  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token,
  };
};
