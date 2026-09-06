const bcrypt = require('bcryptjs');
const { User, Subscription, WorkoutProgram, SessionLog, Measurement } = require('../models');
const { Op } = require('sequelize');

exports.getAllClients = async (req, res) => {
  try {
    const clients = await User.findAll({
      where: { role: 'client' },
      attributes: { exclude: ['passwordHash'] },
      include: [{ association: 'subscriptions', where: { status: 'actif' }, required: false }],
      order: [['createdAt', 'DESC']],
    });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id, role: 'client' },
      attributes: { exclude: ['passwordHash'] },
      include: [
        { association: 'subscriptions' },
        { association: 'programs', include: [{ association: 'sessions', include: ['exercises'] }] },
        { association: 'measurements', limit: 10, order: [['measuredAt', 'DESC']] },
      ],
    });
    if (!user) return res.status(404).json({ message: 'Client introuvable' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, fitnessGoal, experienceLevel, language = 'fr' } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email déjà utilisé' });

    const passwordHash = await bcrypt.hash('Gym2024!', 12); // default password
    const user = await User.create({ firstName, lastName, email, passwordHash, phone, fitnessGoal, experienceLevel, language, role: 'client' });
    const { passwordHash: _, ...userOut } = user.toJSON();
    res.status(201).json({ ...userOut, tempPassword: 'Gym2024!' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    const { firstName, lastName, phone, bio, fitnessGoal, experienceLevel, isActive } = req.body;
    await user.update({ firstName, lastName, phone, bio, fitnessGoal, experienceLevel, isActive });
    const { passwordHash: _, ...userOut } = user.toJSON();
    res.json(userOut);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    await user.update({ isActive: false });
    res.json({ message: 'Client désactivé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalClients = await User.count({ where: { role: 'client', isActive: true } });
    const activeSubscriptions = await Subscription.count({ where: { status: 'actif' } });
    const totalRevenue = await Subscription.sum('price', { where: { status: 'actif' } });
    const newClientsThisMonth = await User.count({
      where: { role: 'client', createdAt: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    });
    res.json({ totalClients, activeSubscriptions, totalRevenue: totalRevenue || 0, newClientsThisMonth });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
