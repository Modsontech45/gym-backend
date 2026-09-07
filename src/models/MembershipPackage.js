const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MembershipPackage = sequelize.define('MembershipPackage', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  gymId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false }, // 'Journée', 'Mensuel', 'Trimestriel', etc.
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.INTEGER, allowNull: false }, // in XOF
  currency: { type: DataTypes.STRING(10), defaultValue: 'XOF' },
  durationDays: { type: DataTypes.INTEGER, allowNull: false }, // 1 = day pass, 30 = monthly, etc.
  features: { type: DataTypes.JSONB }, // array of feature strings
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'membership_packages',
  timestamps: true,
});

module.exports = MembershipPackage;
