const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymMembership = sequelize.define('GymMembership', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  gymId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  requestNote: { type: DataTypes.TEXT },
  reviewNote: { type: DataTypes.TEXT },
  approvedAt: { type: DataTypes.DATE },
  approvedBy: { type: DataTypes.UUID },
}, {
  tableName: 'gym_memberships',
  timestamps: true,
  indexes: [{ unique: true, fields: ['gymId', 'userId'] }],
});

module.exports = GymMembership;
