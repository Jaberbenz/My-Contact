import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer;

// Configuration des variables d'environnement pour les tests
process.env.JWT_SECRET = "test-secret-key-for-testing-only";
process.env.JWT_EXPIRES_IN = "7d";
process.env.NODE_ENV = "test";

// Setup avant tous les tests
export const setupDB = async () => {
  // Créer une instance de MongoDB en mémoire
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Se connecter à la base de données de test
  await mongoose.connect(mongoUri);
};

// Cleanup après tous les tests
export const teardownDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

// Cleanup après chaque test
export const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
