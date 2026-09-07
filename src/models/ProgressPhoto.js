const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProgressPhoto = sequelize.define('ProgressPhoto', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  publicId: { type: DataTypes.STRING },
  takenAt: { type: DataTypes.DATEONLY, allowNull: false },
  notes: { type: DataTypes.TEXT },
  pose: { type: DataTypes.STRING(50) }, // 'front', 'back', 'side', etc.
  isPrivate: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'progress_photos',
  timestamps: true,
});

module.exports = ProgressPhoto;
