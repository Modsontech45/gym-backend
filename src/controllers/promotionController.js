const { Op } = require('sequelize');
const { Promotion } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const promos = await Promotion.findAll({ order: [['createdAt', 'DESC']] });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Promotions currently valid (for applying during subscription creation)
exports.getActive = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const promos = await Promotion.findAll({
      where: {
        isActive: true,
        startDate: { [Op.lte]: today },
        endDate:   { [Op.gte]: today },
      },
    });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Validate a promo code and return its data if valid
exports.validate = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const promo = await Promotion.findOne({
      where: {
        code:      req.params.code,
        isActive:  true,
        startDate: { [Op.lte]: today },
        endDate:   { [Op.gte]: today },
      },
    });
    if (!promo) return res.status(404).json({ message: 'Code promo invalide ou expiré' });
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit)
      return res.status(400).json({ message: 'Code promo épuisé' });
    res.json(promo);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, code, discountType, discountValue, appliesTo, startDate, endDate, usageLimit } = req.body;
    if (!name || !discountType || !discountValue || !startDate || !endDate)
      return res.status(400).json({ message: 'Champs requis manquants' });
    const promo = await Promotion.create({ name, code, discountType, discountValue, appliesTo: appliesTo || 'all', startDate, endDate, usageLimit });
    res.status(201).json(promo);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const promo = await Promotion.findByPk(req.params.id);
    if (!promo) return res.status(404).json({ message: 'Promotion introuvable' });
    const { name, code, discountType, discountValue, appliesTo, startDate, endDate, usageLimit, isActive } = req.body;
    await promo.update({ name, code, discountType, discountValue, appliesTo, startDate, endDate, usageLimit, isActive });
    res.json(promo);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.toggle = async (req, res) => {
  try {
    const promo = await Promotion.findByPk(req.params.id);
    if (!promo) return res.status(404).json({ message: 'Promotion introuvable' });
    await promo.update({ isActive: !promo.isActive });
    res.json(promo);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const promo = await Promotion.findByPk(req.params.id);
    if (!promo) return res.status(404).json({ message: 'Promotion introuvable' });
    await promo.destroy();
    res.json({ message: 'Promotion supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
