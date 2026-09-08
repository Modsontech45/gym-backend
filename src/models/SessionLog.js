const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionLog = sequelize.define('SessionLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  sessionId: { type: DataTypes.UUID, allowNull: false },
  startedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  completedAt: { type: DataTypes.DATE, allowNull: true },
  durationMinutes: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT },
  rating: { type: DataTypes.INTEGER }, // 1-5
}, {
  tableName: 'session_logs',
  timestamps: true,
});

module.exports = SessionLog;
