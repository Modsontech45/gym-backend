const { Subscription, User, Plan, Promotion } = require('../models');
const email = require('../services/emailService');

function computeEndDate(startDate, planType) {
  const d = new Date(startDate);
  switch (planType) {
    case 'journalier':   d.setDate(d.getDate() + 1); break;
    case 'hebdomadaire': d.setDate(d.getDate() + 7); break;
    case 'mensuel':      d.setMonth(d.getMonth() + 1); break;
    case 'trimestriel':  d.setMonth(d.getMonth() + 3); break;
    case 'semestriel':   d.setMonth(d.getMonth() + 6); break;
    case 'annuel':       d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString().split('T')[0];
}

function applyDiscount(price, promo) {
  if (!promo) return { finalPrice: price, discountAmount: 0 };
  let discountAmount = 0;
  if (promo.discountType === 'percentage') {
    discountAmount = price * (parseFloat(promo.discountValue) / 100);
  } else {
    discountAmount = parseFloat(promo.discountValue);
  }
  return {
    finalPrice: Math.max(0, price - discountAmount),
    discountAmount,
  };
}

exports.getAllSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

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
    const { userId, planId, planName: bodyPlanName, planType: bodyPlanType, price: bodyPrice,
            sessionsIncluded: bodySessionsIncluded, promotionId, startDate, notes } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Client introuvable' });

    // Resolve plan details: from catalog or from manual fields
    let planName, planType, basePrice, sessionsIncluded;
    if (planId) {
      const plan = await Plan.findByPk(planId);
      if (!plan) return res.status(404).json({ message: 'Forfait introuvable' });
      planName = plan.name;
      planType = plan.planType;
      basePrice = parseFloat(plan.price);
      sessionsIncluded = plan.sessionsIncluded;
    } else {
      planName = bodyPlanName;
      planType = bodyPlanType;
      basePrice = parseFloat(bodyPrice);
      sessionsIncluded = parseInt(bodySessionsIncluded) || 0;
    }

    // Apply promotion if provided
    let promo = null;
    if (promotionId) {
      promo = await Promotion.findByPk(promotionId);
      if (promo && promo.usageLimit && promo.usageCount >= promo.usageLimit) promo = null;
    }
    const { finalPrice, discountAmount } = applyDiscount(basePrice, promo);

    // Auto-calculate end date
    const actualStartDate = startDate || new Date().toISOString().split('T')[0];
    const endDate = computeEndDate(actualStartDate, planType);

    const sub = await Subscription.create({
      userId, planId: planId || null, planName, planType,
      price: basePrice, balance: finalPrice,
      sessionsIncluded, sessionsUsed: 0,
      discountAmount, startDate: actualStartDate, endDate,
      status: 'actif', notes,
    });

    // Increment promo usage
    if (promo) await promo.increment('usageCount');

    res.status(201).json(sub);

    email.sendSubscriptionCreated({
      firstName: user.firstName, email: user.email,
      planName, planType,
      balance: finalPrice, sessionsIncluded,
      startDate: actualStartDate, endDate,
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
        firstName: user.firstName, email: user.email,
        amount: parseFloat(amount), newBalance, planName: sub.planName,
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
