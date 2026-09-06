const { Notification } = require('../models');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
    res.json({ message: 'Notifications marquées comme lues' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.markOneRead = async (req, res) => {
  try {
    const n = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!n) return res.status(404).json({ message: 'Notification introuvable' });
    await n.update({ isRead: true });
    res.json(n);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
