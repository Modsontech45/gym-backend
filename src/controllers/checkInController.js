const { CheckIn, User } = require('../models');
const { Op } = require('sequelize');

// Get check-ins for a client (coach/admin view)
exports.getClientCheckIns = async (req, res) => {
  try {
    const checkIns = await CheckIn.findAll({
      where: { clientId: req.params.clientId },
      order: [['weekOf', 'DESC']],
      limit: 20,
    });
    res.json(checkIns);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Get all latest check-ins across all clients (coach dashboard)
exports.getLatestCheckIns = async (req, res) => {
  try {
    // Last 7 days
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const checkIns = await CheckIn.findAll({
      where: { createdAt: { [Op.gte]: since } },
      include: [{ model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
      order: [['createdAt', 'DESC']],
      limit: 30,
    });
    res.json(checkIns);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Get own check-ins (client)
exports.getMyCheckIns = async (req, res) => {
  try {
    const checkIns = await CheckIn.findAll({
      where: { clientId: req.user.id },
      order: [['weekOf', 'DESC']],
      limit: 12,
    });
    res.json(checkIns);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Submit check-in (client)
exports.submitCheckIn = async (req, res) => {
  try {
    const { weekOf, sleepQuality, energyLevel, stressLevel, dietAdherence, soreness, sessionsCompleted, weightKg, wins, struggles, notes } = req.body;

    // Calculate current week's Monday if weekOf not provided
    const monday = weekOf || (() => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff)).toISOString().split('T')[0];
    })();

    // Upsert: one check-in per client per week
    const [checkIn, created] = await CheckIn.findOrCreate({
      where: { clientId: req.user.id, weekOf: monday },
      defaults: { clientId: req.user.id, weekOf: monday },
    });

    await checkIn.update({ sleepQuality, energyLevel, stressLevel, dietAdherence, soreness, sessionsCompleted, weightKg, wins, struggles, notes });

    res.status(created ? 201 : 200).json(checkIn);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
