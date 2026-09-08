const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  gymId:        { type: DataTypes.UUID, allowNull: false },
  coachId:      { type: DataTypes.UUID, allowNull: false },
  name:         { type: DataTypes.STRING(200), allowNull: false },
  description:  { type: DataTypes.TEXT },
  image:        { type: DataTypes.STRING },
  category:     { type: DataTypes.STRING(50), defaultValue: 'autre' },
  originalPrice:{ type: DataTypes.DECIMAL(12, 0), allowNull: false },
  currentPrice: { type: DataTypes.DECIMAL(12, 0), allowNull: false },
  currency:     { type: DataTypes.STRING(10), defaultValue: 'FCFA' },
  inStock:      { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'products',
  timestamps: true,
});

module.exports = Product;
