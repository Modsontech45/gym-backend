const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  planName: { type: DataTypes.STRING(100), allowNull: false },
  planType: { type: DataTypes.ENUM('mensuel', 'trimestriel', 'semestriel', 'annuel'), defaultValue: 'mensuel' },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  sessionsIncluded: { type: DataTypes.INTEGER, defaultValue: 0 },
  sessionsUsed: { type: DataTypes.INTEGER, defaultValue: 0 },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('actif', 'expire', 'suspendu', 'annule'), defaultValue: 'actif' },
  notes: { type: DataTypes.TEXT },
}, {
  tableName: 'subscriptions',
  timestamps: true,
});

module.exports = Subscription;
