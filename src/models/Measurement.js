const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Measurement = sequelize.define('Measurement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  weight: { type: DataTypes.DECIMAL(5, 2) }, // kg
  height: { type: DataTypes.DECIMAL(5, 2) }, // cm
  bodyFat: { type: DataTypes.DECIMAL(5, 2) }, // %
  muscleMass: { type: DataTypes.DECIMAL(5, 2) }, // kg
  chest: { type: DataTypes.DECIMAL(5, 2) }, // cm
  waist: { type: DataTypes.DECIMAL(5, 2) },
  hips: { type: DataTypes.DECIMAL(5, 2) },
  arms: { type: DataTypes.DECIMAL(5, 2) },
  thighs: { type: DataTypes.DECIMAL(5, 2) },
  notes: { type: DataTypes.TEXT },
  measuredAt: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
}, {
  tableName: 'measurements',
  timestamps: true,
});

module.exports = Measurement;
