const { GymProgram, Gym, User } = require('../models');

exports.listPublished = async (req, res) => {
  try {
    const gym = await Gym.findOne({ where: { isDefault: true } });
    if (!gym) return res.json([]);
    const { category, difficulty } = req.query;
    const where = { gymId: gym.id, isPublished: true };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    const programs = await GymProgram.findAll({
      where,
      include: [{ model: User, as: 'coach', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
      order: [['enrollCount', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listAll = async (req, res) => {
  try {
    const gym = await Gym.findOne({ where: { isDefault: true } });
    if (!gym) return res.json([]);
    const programs = await GymProgram.findAll({
      where: { gymId: gym.id },
      include: [{ model: User, as: 'coach', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const program = await GymProgram.findByPk(req.params.id, {
      include: [{ model: User, as: 'coach', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
    });
    if (!program) return res.status(404).json({ message: 'Program not found' });
    res.json(program);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const gym = await Gym.findOne({ where: { isDefault: true } });
    if (!gym) return res.status(404).json({ message: 'No gym found' });
    const program = await GymProgram.create({
      ...req.body,
      gymId: gym.id,
      coachId: req.user.id,
    });
    res.status(201).json(program);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const program = await GymProgram.findByPk(req.params.id);
    if (!program) return res.status(404).json({ message: 'Program not found' });
    await program.update(req.body);
    res.json(program);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const program = await GymProgram.findByPk(req.params.id);
    if (!program) return res.status(404).json({ message: 'Program not found' });
    await program.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.enroll = async (req, res) => {
  try {
    const program = await GymProgram.findByPk(req.params.id);
    if (!program) return res.status(404).json({ message: 'Program not found' });
    await program.increment('enrollCount');
    res.json({ message: 'Enrolled', enrollCount: program.enrollCount + 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
