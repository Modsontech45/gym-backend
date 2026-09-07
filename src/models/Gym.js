const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Gym = sequelize.define('Gym', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  logo: { type: DataTypes.STRING },
  coverImage: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING(300) },
  phone: { type: DataTypes.STRING(20) },
  email: { type: DataTypes.STRING(255) },
  website: { type: DataTypes.STRING },
  ownerId: { type: DataTypes.UUID },
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'gyms',
  timestamps: true,
});

module.exports = Gym;
