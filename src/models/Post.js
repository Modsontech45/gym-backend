const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  content: { type: DataTypes.TEXT },
  mediaUrl: { type: DataTypes.STRING },
  mediaType: { type: DataTypes.ENUM('image', 'video', 'none'), defaultValue: 'none' },
  postType: { type: DataTypes.ENUM('progress', 'workout', 'motivation', 'achievement', 'general'), defaultValue: 'general' },
  likesCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  commentsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'posts',
  timestamps: true,
});

module.exports = Post;
