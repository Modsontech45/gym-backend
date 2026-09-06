const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exercise = sequelize.define('Exercise', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sessionId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  sets: { type: DataTypes.INTEGER, defaultValue: 3 },
  reps: { type: DataTypes.STRING(50) }, // e.g. "8-12" or "15"
  restSeconds: { type: DataTypes.INTEGER, defaultValue: 60 },
  weight: { type: DataTypes.STRING(50) },
  videoUrl: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  orderIndex: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'exercises',
  timestamps: true,
});

module.exports = Exercise;
