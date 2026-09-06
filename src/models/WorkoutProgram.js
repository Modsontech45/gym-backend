const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutProgram = sequelize.define('WorkoutProgram', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  clientId: { type: DataTypes.UUID, allowNull: false },
  coachId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  goal: { type: DataTypes.STRING(255) },
  frequencyPerWeek: { type: DataTypes.INTEGER, defaultValue: 3 },
  durationWeeks: { type: DataTypes.INTEGER, defaultValue: 4 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
}, {
  tableName: 'workout_programs',
  timestamps: true,
});

module.exports = WorkoutProgram;
