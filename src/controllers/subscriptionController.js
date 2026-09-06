const { Subscription, User } = require('../models');
const email = require('../services/emailService');

exports.getClientSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.findAll({
      where: { userId: req.params.clientId },
      order: [['createdAt', 'DESC']],
    });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.createSubscription = async (req, res) => {
  try {
    const { userId, planName, planType, price, sessionsIncluded, startDate, endDate, notes } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Client introuvable' });

    const sub = await Subscription.create({
      userId, planName, planType, price,
      balance: price,
      sessionsIncluded, sessionsUsed: 0,
      startDate, endDate, notes, status: 'actif',
    });
    res.status(201).json(sub);
    email.sendSubscriptionCreated({
      firstName: user.firstName,
      email: user.email,
      planName, planType,
      balance: price,
      sessionsIncluded,
      startDate, endDate,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findByPk(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Abonnement introuvable' });
    const { planName, planType, price, balance, sessionsIncluded, startDate, endDate, status, notes } = req.body;
    await sub.update({ planName, planType, price, balance, sessionsIncluded, startDate, endDate, status, notes });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.creditBalance = async (req, res) => {
  try {
    const sub = await Subscription.findByPk(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Abonnement introuvable' });
    const { amount } = req.body;
    const newBalance = parseFloat(sub.balance) + parseFloat(amount);
    await sub.update({ balance: newBalance });
    res.json({ ...sub.toJSON(), balance: newBalance });

    const user = await User.findByPk(sub.userId);
    if (user) {
      email.sendBalanceCredited({
        firstName: user.firstName,
        email: user.email,
        amount: parseFloat(amount),
        newBalance,
        planName: sub.planName,
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.mySubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
