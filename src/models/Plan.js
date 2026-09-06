const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plan = sequelize.define('Plan', {
  id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:            { type: DataTypes.STRING(100), allowNull: false },
  planType:        { type: DataTypes.ENUM('journalier', 'hebdomadaire', 'mensuel'), allowNull: false },
  price:           { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  sessionsIncluded:{ type: DataTypes.INTEGER, defaultValue: 0 },
  description:     { type: DataTypes.TEXT },
  isActive:        { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'plans',
  timestamps: true,
});

module.exports = Plan;
