const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CoachNote = sequelize.define('CoachNote', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  coachId: { type: DataTypes.UUID, allowNull: false },
  clientId: { type: DataTypes.UUID, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  pinned: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'coach_notes',
  timestamps: true,
});

module.exports = CoachNote;
