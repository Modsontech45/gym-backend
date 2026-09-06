const { FollowUp, User, Notification } = require('../models');

exports.getFollowUps = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'coach' || req.user.role === 'admin') {
      where.coachId = req.user.id;
    } else {
      where.clientId = req.user.id;
    }
    if (req.query.clientId) where.clientId = req.query.clientId;
    if (req.query.status) where.status = req.query.status;

    const followUps = await FollowUp.findAll({
      where,
      include: [
        { association: 'coach', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
        { association: 'client', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
      ],
      order: [['scheduledDate', 'ASC']],
    });
    res.json(followUps);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.createFollowUp = async (req, res) => {
  try {
    const { clientId, title, note, scheduledDate, priority } = req.body;
    const followUp = await FollowUp.create({
      coachId: req.user.id, clientId, title, note, scheduledDate, priority,
    });

    await Notification.create({
      userId: clientId,
      type: 'followup',
      title: 'Suivi planifié',
      body: `Votre coach a planifié un suivi: ${title}`,
      data: { followUpId: followUp.id },
    });

    const full = await FollowUp.findByPk(followUp.id, {
      include: [
        { association: 'coach', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
        { association: 'client', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
      ],
    });
    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.updateFollowUp = async (req, res) => {
  try {
    const fu = await FollowUp.findByPk(req.params.id);
    if (!fu) return res.status(404).json({ message: 'Suivi introuvable' });
    const { title, note, scheduledDate, status, priority } = req.body;
    const updates = { title, note, scheduledDate, status, priority };
    if (status === 'complete') updates.completedAt = new Date();
    await fu.update(updates);
    res.json(fu);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.deleteFollowUp = async (req, res) => {
  try {
    const fu = await FollowUp.findByPk(req.params.id);
    if (!fu) return res.status(404).json({ message: 'Suivi introuvable' });
    await fu.destroy();
    res.json({ message: 'Suivi supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
