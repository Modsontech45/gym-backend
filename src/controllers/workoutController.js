const { WorkoutProgram, WorkoutSession, Exercise, SessionLog, User } = require('../models');
const { Op } = require('sequelize');

exports.getClientPrograms = async (req, res) => {
  try {
    const clientId = req.params.clientId || req.user.id;
    const programs = await WorkoutProgram.findAll({
      where: { clientId },
      include: [
        { association: 'sessions', include: ['exercises'], order: [['orderIndex', 'ASC']] },
        { association: 'coach', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.createProgram = async (req, res) => {
  try {
    const { clientId, name, description, goal, frequencyPerWeek, durationWeeks, startDate, endDate } = req.body;
    const program = await WorkoutProgram.create({
      clientId, coachId: req.user.id, name, description, goal,
      frequencyPerWeek, durationWeeks, startDate, endDate,
    });
    res.status(201).json(program);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const program = await WorkoutProgram.findByPk(req.params.id);
    if (!program) return res.status(404).json({ message: 'Programme introuvable' });
    await program.update(req.body);
    res.json(program);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.addSession = async (req, res) => {
  try {
    const { programId, name, dayOfWeek, durationMinutes, muscleGroups, notes, orderIndex } = req.body;
    const session = await WorkoutSession.create({ programId, name, dayOfWeek, durationMinutes, muscleGroups, notes, orderIndex });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.addExercise = async (req, res) => {
  try {
    const { sessionId, name, sets, reps, restSeconds, weight, videoUrl, notes, orderIndex } = req.body;
    const exercise = await Exercise.create({ sessionId, name, sets, reps, restSeconds, weight, videoUrl, notes, orderIndex });
    res.status(201).json(exercise);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.logSession = async (req, res) => {
  try {
    const { sessionId, durationMinutes, notes, rating } = req.body;
    const log = await SessionLog.create({
      userId: req.user.id, sessionId, durationMinutes, notes, rating, completedAt: new Date(),
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const program = await WorkoutProgram.findByPk(req.params.id);
    if (!program) return res.status(404).json({ message: 'Programme introuvable' });
    await program.destroy();
    res.json({ message: 'Programme supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.getProgramDetail = async (req, res) => {
  try {
    const program = await WorkoutProgram.findByPk(req.params.id, {
      include: [
        { association: 'sessions', include: [{ association: 'exercises', order: [['orderIndex', 'ASC']] }], order: [['orderIndex', 'ASC']] },
        { association: 'coach', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
        { association: 'client', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
      ],
    });
    if (!program) return res.status(404).json({ message: 'Programme introuvable' });
    res.json(program);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const session = await WorkoutSession.findByPk(req.params.id);
    if (!session) return res.status(404).json({ message: 'Séance introuvable' });
    await session.update(req.body);
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await WorkoutSession.findByPk(req.params.id);
    if (!session) return res.status(404).json({ message: 'Séance introuvable' });
    await session.destroy();
    res.json({ message: 'Séance supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercice introuvable' });
    await exercise.update(req.body);
    res.json(exercise);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercice introuvable' });
    await exercise.destroy();
    res.json({ message: 'Exercice supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.getWorkoutStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [weekLogs, monthLogs, allTimeLogs] = await Promise.all([
      SessionLog.count({ where: { userId, completedAt: { [Op.gte]: weekStart } } }),
      SessionLog.count({ where: { userId, completedAt: { [Op.gte]: monthStart } } }),
      SessionLog.findAll({
        where: { userId },
        attributes: ['completedAt', 'durationMinutes', 'rating'],
        order: [['completedAt', 'DESC']],
        limit: 90,
      }),
    ]);

    // Build last-30-days daily count for heatmap
    const dayCounts = {};
    for (const log of allTimeLogs) {
      const d = new Date(log.completedAt).toISOString().split('T')[0];
      dayCounts[d] = (dayCounts[d] || 0) + 1;
    }

    const totalDuration = allTimeLogs.reduce((s, l) => s + (l.durationMinutes || 0), 0);
    const avgDuration = allTimeLogs.length ? Math.round(totalDuration / allTimeLogs.length) : 0;
    const ratings = allTimeLogs.map(l => l.rating).filter(Boolean);
    const avgRating = ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 10) / 10 : null;

    res.json({
      thisWeek: weekLogs,
      thisMonth: monthLogs,
      allTime: allTimeLogs.length,
      avgDurationMinutes: avgDuration,
      avgRating,
      dayCounts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSessionLogs = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const logs = await SessionLog.findAll({
      where: { userId },
      include: [{
        model: WorkoutSession,
        as: 'session',
        attributes: ['id', 'name', 'durationMinutes', 'muscleGroups'],
        include: [{
          model: WorkoutProgram,
          as: 'program',
          attributes: ['id', 'name'],
        }],
      }],
      order: [['completedAt', 'DESC']],
      limit: 50,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
