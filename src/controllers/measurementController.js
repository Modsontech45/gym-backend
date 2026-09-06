const { Measurement } = require('../models');

exports.getMyMeasurements = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const measurements = await Measurement.findAll({
      where: { userId },
      order: [['measuredAt', 'DESC']],
    });
    res.json(measurements);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.addMeasurement = async (req, res) => {
  try {
    const { weight, height, bodyFat, muscleMass, chest, waist, hips, arms, thighs, notes, measuredAt } = req.body;
    const userId = req.body.userId || req.user.id;
    const m = await Measurement.create({ userId, weight, height, bodyFat, muscleMass, chest, waist, hips, arms, thighs, notes, measuredAt });
    res.status(201).json(m);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.updateMeasurement = async (req, res) => {
  try {
    const m = await Measurement.findByPk(req.params.id);
    if (!m) return res.status(404).json({ message: 'Mesure introuvable' });
    await m.update(req.body);
    res.json(m);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.deleteMeasurement = async (req, res) => {
  try {
    const m = await Measurement.findByPk(req.params.id);
    if (!m) return res.status(404).json({ message: 'Mesure introuvable' });
    if (m.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'coach') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    await m.destroy();
    res.json({ message: 'Mesure supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
