const sequelize = require('../config/database');
const User = require('./User');
const Subscription = require('./Subscription');
const Plan = require('./Plan');
const Promotion = require('./Promotion');
const Post = require('./Post');
const PostLike = require('./PostLike');
const PostComment = require('./PostComment');
const WorkoutProgram = require('./WorkoutProgram');
const WorkoutSession = require('./WorkoutSession');
const Exercise = require('./Exercise');
const SessionLog = require('./SessionLog');
const Message = require('./Message');
const FollowUp = require('./FollowUp');
const Notification = require('./Notification');
const Measurement = require('./Measurement');

// User associations
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });

User.hasMany(PostLike, { foreignKey: 'userId' });
PostLike.belongsTo(User, { foreignKey: 'userId' });

Post.hasMany(PostLike, { foreignKey: 'postId', as: 'likes' });
PostLike.belongsTo(Post, { foreignKey: 'postId' });

Post.hasMany(PostComment, { foreignKey: 'postId', as: 'comments' });
PostComment.belongsTo(Post, { foreignKey: 'postId' });
PostComment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
User.hasMany(PostComment, { foreignKey: 'userId' });

User.hasMany(WorkoutProgram, { foreignKey: 'clientId', as: 'programs' });
WorkoutProgram.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
WorkoutProgram.belongsTo(User, { foreignKey: 'coachId', as: 'coach' });

WorkoutProgram.hasMany(WorkoutSession, { foreignKey: 'programId', as: 'sessions' });
WorkoutSession.belongsTo(WorkoutProgram, { foreignKey: 'programId' });

WorkoutSession.hasMany(Exercise, { foreignKey: 'sessionId', as: 'exercises' });
Exercise.belongsTo(WorkoutSession, { foreignKey: 'sessionId' });

User.hasMany(SessionLog, { foreignKey: 'userId', as: 'sessionLogs' });
SessionLog.belongsTo(User, { foreignKey: 'userId' });
SessionLog.belongsTo(WorkoutSession, { foreignKey: 'sessionId' });

Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

FollowUp.belongsTo(User, { foreignKey: 'coachId', as: 'coach' });
FollowUp.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Measurement.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Measurement, { foreignKey: 'userId', as: 'measurements' });

module.exports = {
  sequelize,
  User,
  Subscription,
  Plan,
  Promotion,
  Post,
  PostLike,
  PostComment,
  WorkoutProgram,
  WorkoutSession,
  Exercise,
  SessionLog,
  Message,
  FollowUp,
  Notification,
  Measurement,
};
