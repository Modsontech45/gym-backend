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
  fitnessGoal: { type: DataTypes.STRING(255) },
  experienceLevel: { type: DataTypes.ENUM('debutant', 'intermediaire', 'avance'), defaultValue: 'debutant' },
  language: { type: DataTypes.ENUM('fr', 'en'), defaultValue: 'fr' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  lastLoginAt: { type: DataTypes.DATE },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
