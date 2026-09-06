const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  senderId: { type: DataTypes.UUID, allowNull: false },
  receiverId: { type: DataTypes.UUID, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt: { type: DataTypes.DATE },
}, {
  tableName: 'messages',
  timestamps: true,
});

module.exports = Message;
