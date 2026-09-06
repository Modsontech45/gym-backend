const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FollowUp = sequelize.define('FollowUp', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  coachId: { type: DataTypes.UUID, allowNull: false },
  clientId: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  note: { type: DataTypes.TEXT },
  scheduledDate: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('planifie', 'complete', 'reporte', 'annule'), defaultValue: 'planifie' },
  completedAt: { type: DataTypes.DATE },
  priority: { type: DataTypes.ENUM('basse', 'normale', 'haute'), defaultValue: 'normale' },
}, {
  tableName: 'follow_ups',
  timestamps: true,
});

module.exports = FollowUp;
