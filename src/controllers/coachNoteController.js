const { CoachNote, User } = require('../models');

exports.getClientNotes = async (req, res) => {
  try {
    const notes = await CoachNote.findAll({
      where: { clientId: req.params.clientId },
      include: [{ model: User, as: 'coach', attributes: ['id', 'firstName', 'lastName'] }],
      order: [['pinned', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { clientId, content, pinned } = req.body;
    if (!clientId || !content?.trim()) return res.status(400).json({ message: 'clientId et content requis' });
    const note = await CoachNote.create({ coachId: req.user.id, clientId, content: content.trim(), pinned: !!pinned });
    const full = await CoachNote.findByPk(note.id, {
      include: [{ model: User, as: 'coach', attributes: ['id', 'firstName', 'lastName'] }],
    });
    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const note = await CoachNote.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note introuvable' });
    if (note.coachId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    await note.update({ content: req.body.content ?? note.content, pinned: req.body.pinned ?? note.pinned });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await CoachNote.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note introuvable' });
    if (note.coachId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    await note.destroy();
    res.json({ message: 'Note supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
