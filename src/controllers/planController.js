const { Plan } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const plans = await Plan.findAll({ order: [['planType', 'ASC'], ['price', 'ASC']] });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, planType, price, sessionsIncluded, description } = req.body;
    if (!name || !planType || !price) return res.status(400).json({ message: 'Champs requis manquants' });
    const plan = await Plan.create({ name, planType, price, sessionsIncluded: sessionsIncluded || 0, description });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Forfait introuvable' });
    const { name, planType, price, sessionsIncluded, description, isActive } = req.body;
    await plan.update({ name, planType, price, sessionsIncluded, description, isActive });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Forfait introuvable' });
    await plan.destroy();
    res.json({ message: 'Forfait supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
