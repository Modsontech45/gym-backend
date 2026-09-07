const { Gym, GymMembership, MembershipPackage, User } = require('../models');
const { Op } = require('sequelize');

// ── Gym info ──────────────────────────────────────────────────────────────────

exports.getDefaultGym = async (req, res) => {
  try {
    const gym = await Gym.findOne({
      where: { isDefault: true },
      include: [
        { model: MembershipPackage, as: 'packages', where: { isActive: true }, required: false, order: [['sortOrder', 'ASC']] },
        { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
      ],
    });
    if (!gym) return res.status(404).json({ message: 'Gym not found' });
    res.json(gym);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateGym = async (req, res) => {
  try {
    const gym = await Gym.findOne({ where: { isDefault: true } });
    if (!gym) return res.status(404).json({ message: 'Gym not found' });
    await gym.update(req.body);
    res.json(gym);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Membership packages ───────────────────────────────────────────────────────

exports.getPackages = async (req, res) => {
  try {
    const gym = await Gym.findOne({ where: { isDefault: true } });
    if (!gym) return res.json([]);
    const packages = await MembershipPackage.findAll({
      where: { gymId: gym.id, isActive: true },
      order: [['sortOrder', 'ASC']],
    });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPackage = async (req, res) => {
  try {
    const gym = await Gym.findOne({ where: { isDefault: true } });
    if (!gym) return res.status(404).json({ message: 'Gym not found' });
    const pkg = await MembershipPackage.create({ ...req.body, gymId: gym.id });
    res.status(201).json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const pkg = await MembershipPackage.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    await pkg.update(req.body);
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const pkg = await MembershipPackage.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    await pkg.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Membership requests ───────────────────────────────────────────────────────

exports.requestMembership = async (req, res) => {
  try {
    const gym = await Gym.findOne({ where: { isDefault: true } });
    if (!gym) return res.status(404).json({ message: 'No gym available' });

    const existing = await GymMembership.findOne({ where: { gymId: gym.id, userId: req.user.id } });
    if (existing) return res.json(existing); // already exists (pending/approved/rejected)

    const membership = await GymMembership.create({
      gymId: gym.id,
      userId: req.user.id,
      status: 'pending',
      requestNote: req.body.requestNote,
    });
    res.status(201).json(membership);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyMembership = async (req, res) => {
  try {
    const gym = await Gym.findOne({ where: { isDefault: true } });
    if (!gym) return res.json(null);
    const membership = await GymMembership.findOne({
      where: { gymId: gym.id, userId: req.user.id },
      include: [{ model: Gym, as: 'gym' }],
    });
    res.json(membership);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin: manage membership requests ────────────────────────────────────────

exports.getPendingRequests = async (req, res) => {
  try {
    const gym = await Gym.findOne({ where: { isDefault: true } });
    if (!gym) return res.json([]);
    const requests = await GymMembership.findAll({
      where: { gymId: gym.id, status: 'pending' },
      include: [{ model: User, as: 'member', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'role'] }],
      order: [['createdAt', 'ASC']],
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllMembers = async (req, res) => {
  try {
    const gym = await Gym.findOne({ where: { isDefault: true } });
    if (!gym) return res.json([]);
    const { status } = req.query;
    const where = { gymId: gym.id };
    if (status) where.status = status;
    const members = await GymMembership.findAll({
      where,
      include: [{ model: User, as: 'member', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'role'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reviewMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const membership = await GymMembership.findByPk(id, {
      include: [{ model: User, as: 'member', attributes: ['id', 'firstName', 'lastName', 'email'] }],
    });
    if (!membership) return res.status(404).json({ message: 'Membership not found' });
    await membership.update({
      status,
      reviewNote,
      approvedAt: status === 'approved' ? new Date() : null,
      approvedBy: req.user.id,
    });
    res.json(membership);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
