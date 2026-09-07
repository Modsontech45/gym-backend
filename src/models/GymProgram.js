const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymProgram = sequelize.define('GymProgram', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  gymId: { type: DataTypes.UUID, allowNull: false },
  coachId: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING(100) }, // 'muscu', 'cardio', 'yoga', 'crossfit', etc.
  difficulty: { type: DataTypes.ENUM('debutant', 'intermediaire', 'avance'), defaultValue: 'debutant' },
  durationWeeks: { type: DataTypes.INTEGER, defaultValue: 4 },
  frequencyPerWeek: { type: DataTypes.INTEGER, defaultValue: 3 },
  thumbnail: { type: DataTypes.STRING },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
  enrollCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  sessions: { type: DataTypes.JSONB }, // stored as JSON array [{name, dayOfWeek, exercises:[{name,sets,reps}]}]
}, {
  tableName: 'gym_programs',
  timestamps: true,
});

module.exports = GymProgram;
