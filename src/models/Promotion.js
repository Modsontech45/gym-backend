const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Promotion = sequelize.define('Promotion', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:          { type: DataTypes.STRING(100), allowNull: false },
  code:          { type: DataTypes.STRING(30) },           // optional promo code
  discountType:  { type: DataTypes.ENUM('percentage', 'fixed'), allowNull: false },
  discountValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  appliesTo:     { type: DataTypes.ENUM('all', 'journalier', 'hebdomadaire', 'mensuel'), defaultValue: 'all' },
  startDate:     { type: DataTypes.DATEONLY, allowNull: false },
  endDate:       { type: DataTypes.DATEONLY, allowNull: false },
  isActive:      { type: DataTypes.BOOLEAN, defaultValue: true },
  usageLimit:    { type: DataTypes.INTEGER },              // null = unlimited
  usageCount:    { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'promotions',
  timestamps: true,
});

module.exports = Promotion;
