import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://mycontact:azerty@atlascluster.dhx6k5h.mongodb.net/My-contact-bd?retryWrites=true&w=majority&appName=AtlasCluster",
      {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Gérer les événements de déconnexion
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

    return conn; // Important: retourner la connexion
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    throw error; // Lancer l'erreur pour que startServer puisse la gérer
  }
};

export default connectDB;
