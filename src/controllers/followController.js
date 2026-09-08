const { Follow, User, GymMembership, Gym } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.follow = async (req, res) => {
  try {
    const { targetId } = req.params;
    if (targetId === req.user.id) return res.status(400).json({ message: 'Cannot follow yourself' });

    const [follow, created] = await Follow.findOrCreate({
      where: { followerId: req.user.id, followingId: targetId },
    });
    res.status(created ? 201 : 200).json({ following: true, id: follow.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unfollow = async (req, res) => {
  try {
    const { targetId } = req.params;
    await Follow.destroy({ where: { followerId: req.user.id, followingId: targetId } });
    res.json({ following: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const rows = await Follow.findAll({
      where: { followingId: userId },
      include: [{ model: User, as: 'follower', attributes: ['id', 'firstName', 'lastName', 'avatar', 'role'] }],
    });
    res.json(rows.map(r => r.follower));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const rows = await Follow.findAll({
      where: { followerId: userId },
      include: [{ model: User, as: 'following', attributes: ['id', 'firstName', 'lastName', 'avatar', 'role'] }],
    });
    res.json(rows.map(r => r.following));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const gym = await Gym.findOne({ where: { isDefault: true } });
    if (!gym) return res.json([]);

    const memberships = await GymMembership.findAll({
      where: { gymId: gym.id },
      attributes: ['userId'],
    });
    const memberIds = memberships.map(m => m.userId).filter(id => id !== req.user.id);

    // Get who I'm already following
    const myFollows = await Follow.findAll({
      where: { followerId: req.user.id },
      attributes: ['followingId'],
    });
    const followingIds = new Set(myFollows.map(f => f.followingId));

    const whereClause = memberIds.length > 0
      ? { id: { [Op.in]: memberIds } }
      : { id: { [Op.ne]: req.user.id } };

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'firstName', 'lastName', 'avatar', 'role', 'bio', 'location', 'fitnessGoal'],
      order: [
        // coaches/admins first, then alphabetical
        sequelize.literal(`CASE WHEN role = 'admin' THEN 0 WHEN role = 'coach' THEN 1 ELSE 2 END`),
        ['firstName', 'ASC'],
      ],
      limit: 50,
    });

    // Put not-yet-followed first
    const sorted = [
      ...users.filter(u => !followingIds.has(u.id)),
      ...users.filter(u => followingIds.has(u.id)),
    ];

    res.json(sorted.map(u => ({ ...u.toJSON(), isFollowing: followingIds.has(u.id) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchMembers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json([]);

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: req.user.id },
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${q}%` } },
          { lastName: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } },
          { phone: { [Op.iLike]: `%${q}%` } },
          { location: { [Op.iLike]: `%${q}%` } },
          { bio: { [Op.iLike]: `%${q}%` } },
          { fitnessGoal: { [Op.iLike]: `%${q}%` } },
        ],
      },
      attributes: ['id', 'firstName', 'lastName', 'avatar', 'role', 'bio', 'location'],
      limit: 20,
    });

    const myFollows = await Follow.findAll({
      where: { followerId: req.user.id, followingId: { [Op.in]: users.map(u => u.id) } },
      attributes: ['followingId'],
    });
    const followingSet = new Set(myFollows.map(f => f.followingId));

    res.json(users.map(u => ({ ...u.toJSON(), isFollowing: followingSet.has(u.id) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
