const { Appointment, User } = require('../models');
const { Op } = require('sequelize');

const userAttrs = ['id', 'firstName', 'lastName', 'avatar'];

exports.getMyAppointments = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = req.user.role === 'client'
      ? { clientId: req.user.id }
      : { coachId: req.user.id };
    if (from || to) {
      where.startTime = {};
      if (from) where.startTime[Op.gte] = new Date(from);
      if (to) where.startTime[Op.lte] = new Date(to);
    }
    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: User, as: 'coach', attributes: userAttrs },
        { model: User, as: 'client', attributes: userAttrs },
      ],
      order: [['startTime', 'ASC']],
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { clientId, coachId, title, startTime, endTime, notes, location, sessionId } = req.body;
    const coachIdResolved = coachId || req.user.id;
    const appointment = await Appointment.create({
      coachId: coachIdResolved, clientId, title, startTime, endTime,
      notes, location, sessionId,
      status: req.user.role === 'client' ? 'pending' : 'confirmed',
    });
    const full = await Appointment.findByPk(appointment.id, {
      include: [
        { model: User, as: 'coach', attributes: userAttrs },
        { model: User, as: 'client', attributes: userAttrs },
      ],
    });
    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ message: 'RDV introuvable' });
    const isOwner = appt.coachId === req.user.id || appt.clientId === req.user.id;
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });
    await appt.update(req.body);
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ message: 'RDV introuvable' });
    const isOwner = appt.coachId === req.user.id || appt.clientId === req.user.id;
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });
    await appt.destroy();
    res.json({ message: 'RDV supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
