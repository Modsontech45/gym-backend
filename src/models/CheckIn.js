const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CheckIn = sequelize.define('CheckIn', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  clientId: { type: DataTypes.UUID, allowNull: false },
  weekOf: { type: DataTypes.DATEONLY, allowNull: false }, // Monday of the week
  // 1-5 scales
  sleepQuality: { type: DataTypes.INTEGER },      // 1-5
  energyLevel: { type: DataTypes.INTEGER },        // 1-5
  stressLevel: { type: DataTypes.INTEGER },        // 1-5 (5 = very stressed)
  dietAdherence: { type: DataTypes.INTEGER },      // 1-5
  soreness: { type: DataTypes.INTEGER },           // 1-5
  // Numbers
  sessionsCompleted: { type: DataTypes.INTEGER },
  weightKg: { type: DataTypes.DECIMAL(5, 2) },
  // Text
  wins: { type: DataTypes.TEXT },        // what went well
  struggles: { type: DataTypes.TEXT },   // challenges
  notes: { type: DataTypes.TEXT },       // open field
}, {
  tableName: 'check_ins',
  timestamps: true,
});

module.exports = CheckIn;
