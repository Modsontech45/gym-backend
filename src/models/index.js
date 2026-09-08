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
const CoachNote = require('./CoachNote');
const CheckIn = require('./CheckIn');
const Appointment = require('./Appointment');
const ProgressPhoto = require('./ProgressPhoto');
const Gym = require('./Gym');
const GymMembership = require('./GymMembership');
const GymProgram = require('./GymProgram');
const Follow = require('./Follow');
const MembershipPackage = require('./MembershipPackage');
const Product = require('./Product');

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
WorkoutSession.belongsTo(WorkoutProgram, { foreignKey: 'programId', as: 'program' });

WorkoutSession.hasMany(Exercise, { foreignKey: 'sessionId', as: 'exercises' });
Exercise.belongsTo(WorkoutSession, { foreignKey: 'sessionId' });

User.hasMany(SessionLog, { foreignKey: 'userId', as: 'sessionLogs' });
SessionLog.belongsTo(User, { foreignKey: 'userId' });
SessionLog.belongsTo(WorkoutSession, { foreignKey: 'sessionId', as: 'session' });
WorkoutSession.hasMany(SessionLog, { foreignKey: 'sessionId', as: 'logs' });

Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

FollowUp.belongsTo(User, { foreignKey: 'coachId', as: 'coach' });
FollowUp.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Measurement.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Measurement, { foreignKey: 'userId', as: 'measurements' });

CoachNote.belongsTo(User, { foreignKey: 'coachId', as: 'coach' });
CoachNote.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
User.hasMany(CoachNote, { foreignKey: 'clientId', as: 'coachNotes' });

CheckIn.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
User.hasMany(CheckIn, { foreignKey: 'clientId', as: 'checkIns' });

Appointment.belongsTo(User, { foreignKey: 'coachId', as: 'coach' });
Appointment.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
User.hasMany(Appointment, { foreignKey: 'coachId', as: 'coachAppointments' });
User.hasMany(Appointment, { foreignKey: 'clientId', as: 'clientAppointments' });

ProgressPhoto.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ProgressPhoto, { foreignKey: 'userId', as: 'progressPhotos' });

// Gym associations
MembershipPackage.belongsTo(Gym, { foreignKey: 'gymId', as: 'gym' });
Gym.hasMany(MembershipPackage, { foreignKey: 'gymId', as: 'packages' });

Gym.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
User.hasMany(Gym, { foreignKey: 'ownerId', as: 'ownedGyms' });

Gym.hasMany(GymMembership, { foreignKey: 'gymId', as: 'memberships' });
GymMembership.belongsTo(Gym, { foreignKey: 'gymId', as: 'gym' });
GymMembership.belongsTo(User, { foreignKey: 'userId', as: 'member' });
User.hasMany(GymMembership, { foreignKey: 'userId', as: 'gymMemberships' });

Gym.hasMany(GymProgram, { foreignKey: 'gymId', as: 'gymPrograms' });
GymProgram.belongsTo(Gym, { foreignKey: 'gymId', as: 'gym' });
GymProgram.belongsTo(User, { foreignKey: 'coachId', as: 'coach' });
User.hasMany(GymProgram, { foreignKey: 'coachId', as: 'createdGymPrograms' });

// Product associations
Product.belongsTo(Gym, { foreignKey: 'gymId', as: 'gym' });
Gym.hasMany(Product, { foreignKey: 'gymId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'coachId', as: 'seller' });
User.hasMany(Product, { foreignKey: 'coachId', as: 'products' });

// Follow associations
Follow.belongsTo(User, { foreignKey: 'followerId', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'followingId', as: 'following' });
User.hasMany(Follow, { foreignKey: 'followerId', as: 'following' });
User.hasMany(Follow, { foreignKey: 'followingId', as: 'followers' });

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
  CoachNote,
  CheckIn,
  Appointment,
  ProgressPhoto,
  Gym,
  GymMembership,
  GymProgram,
  Follow,
  MembershipPackage,
  Product,
};
