const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutSession = sequelize.define('WorkoutSession', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  programId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  dayOfWeek: { type: DataTypes.INTEGER }, // 1=Monday ... 7=Sunday
  orderIndex: { type: DataTypes.INTEGER, defaultValue: 0 },
  durationMinutes: { type: DataTypes.INTEGER, defaultValue: 60 },
  muscleGroups: { type: DataTypes.ARRAY(DataTypes.STRING) },
  notes: { type: DataTypes.TEXT },
}, {
  tableName: 'workout_sessions',
  timestamps: true,
});

module.exports = WorkoutSession;
