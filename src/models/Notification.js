const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('message', 'followup', 'subscription', 'post_like', 'post_comment', 'workout', 'general'), defaultValue: 'general' },
  title: { type: DataTypes.STRING(255) },
  body: { type: DataTypes.TEXT },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  data: { type: DataTypes.JSONB },
}, {
  tableName: 'notifications',
  timestamps: true,
});

module.exports = Notification;
