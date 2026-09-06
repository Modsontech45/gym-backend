const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  firstName: { type: DataTypes.STRING(100), allowNull: false },
  lastName: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'coach', 'client'), defaultValue: 'client' },
  avatar: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING(20) },
  bio: { type: DataTypes.TEXT },
  gender: { type: DataTypes.ENUM('homme', 'femme', 'autre'), defaultValue: 'homme' },
  dateOfBirth: { type: DataTypes.DATEONLY },
  height: { type: DataTypes.INTEGER },
  weight: { type: DataTypes.DECIMAL(5, 1) },
  location: { type: DataTypes.STRING(255) },
  bodyType: { type: DataTypes.STRING(50) },
  coachPreference: { type: DataTypes.ENUM('coach', 'autonome'), defaultValue: 'autonome' },
  fitnessGoal: { type: DataTypes.STRING(255) },
  experienceLevel: { type: DataTypes.ENUM('debutant', 'intermediaire', 'avance'), defaultValue: 'debutant' },
  language: { type: DataTypes.ENUM('fr', 'en'), defaultValue: 'fr' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  surveyCompleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  lastLoginAt: { type: DataTypes.DATE },
  isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  emailVerificationCode: { type: DataTypes.STRING(6) },
  emailVerificationExpiry: { type: DataTypes.DATE },
  passwordResetCode: { type: DataTypes.STRING(6) },
  passwordResetExpiry: { type: DataTypes.DATE },
  aiPlan: { type: DataTypes.TEXT },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
