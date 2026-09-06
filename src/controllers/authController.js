const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Subscription } = require('../models');
const email = require('../services/emailService');

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.register = async (req, res) => {
  try {
    const {
      firstName, lastName, email: email_, password, phone, language = 'fr',
      gender, dateOfBirth, height, weight, location, bodyType, fitnessGoal, experienceLevel, coachPreference,
    } = req.body;
    const exists = await User.findOne({ where: { email: email_ } });
    if (exists) return res.status(409).json({ message: 'Email déjà utilisé' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      firstName, lastName, email: email_, passwordHash, phone, language, role: 'client',
      gender, dateOfBirth, height, weight, location, bodyType, fitnessGoal, experienceLevel, coachPreference,
    });

    const token = generateToken(user);
    const { passwordHash: _, ...userOut } = user.toJSON();
    res.status(201).json({ token, user: userOut });

    // Non-blocking emails
    email.sendWelcome({ firstName, email: email_ });
    email.sendNewClientAlert({ clientFirstName: firstName, clientLastName, clientEmail: email_ });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Identifiants incorrects' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Identifiants incorrects' });

    await user.update({ lastLoginAt: new Date() });
    const token = generateToken(user);
    const { passwordHash: _, ...userOut } = user.toJSON();
    res.json({ token, user: userOut });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ association: 'subscriptions', where: { status: 'actif' }, required: false }],
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, fitnessGoal, experienceLevel, language } = req.body;
    const updates = { firstName, lastName, phone, bio, fitnessGoal, experienceLevel, language };
    if (req.file) updates.avatar = req.file.path;
    await req.user.update(updates);
    const { passwordHash: _, ...userOut } = req.user.toJSON();
    res.json(userOut);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.saveSurvey = async (req, res) => {
  try {
    const { fitnessGoal, coachPreference, bodyType, experienceLevel } = req.body;
    await req.user.update({ fitnessGoal, coachPreference, bodyType, experienceLevel, surveyCompleted: true });
    const { passwordHash: _, ...userOut } = req.user.toJSON();
    res.json(userOut);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await user.update({ passwordHash });
    res.json({ message: 'Mot de passe modifié avec succès' });
    email.sendPasswordChanged({ firstName: user.firstName, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
