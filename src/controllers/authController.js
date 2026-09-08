const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Gym, GymMembership, Follow } = require('../models');
const email = require('../services/emailService');
const { generateFitnessPlan } = require('../services/fitnessEngine');

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const randomCode = () => String(Math.floor(100000 + Math.random() * 900000));

// Auto-follow gym owner + all coaches for a given userId (fire-and-forget)
async function autoFollowGymStaff(userId) {
  try {
    const gym = await Gym.findOne({ where: { isDefault: true }, include: [{ association: 'owner' }] });
    if (!gym) return;
    // Collect staff: gym owner + all coaches/admins
    const staff = await User.findAll({ where: { role: ['admin', 'coach'] }, attributes: ['id'] });
    const targets = new Set([gym.ownerId, ...staff.map(u => u.id)]);
    targets.delete(userId); // don't self-follow
    for (const targetId of targets) {
      await Follow.findOrCreate({ where: { followerId: userId, followingId: targetId } });
    }
  } catch (_) {}
}


exports.register = async (req, res) => {
  try {
    const {
      firstName, lastName, email: email_, password, phone, language = 'fr',
      gender, dateOfBirth, height, weight, location,
    } = req.body;

    const exists = await User.findOne({ where: { email: email_ } });
    if (exists) return res.status(409).json({ message: 'Email déjà utilisé' });

    const passwordHash = await bcrypt.hash(password, 12);
    const code = randomCode();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await User.create({
      firstName, lastName, email: email_, passwordHash, phone, language, role: 'client',
      gender, dateOfBirth, height, weight, location,
      emailVerificationCode: code, emailVerificationExpiry: codeExpiry, isEmailVerified: false,
    });

    res.status(201).json({ message: 'Compte créé. Vérifiez votre email.', email: email_ });

    email.sendVerificationCode({ firstName, email: email_, code });
    email.sendNewClientAlert({ clientFirstName: firstName, clientLastName: lastName, clientEmail: email_ });

    // Auto-create pending gym membership for the default gym
    const newUser = await User.findOne({ where: { email: email_ } });
    const defaultGym = await Gym.findOne({ where: { isDefault: true } });
    if (newUser && defaultGym) {
      await GymMembership.findOrCreate({
        where: { gymId: defaultGym.id, userId: newUser.id },
        defaults: { status: 'pending' },
      });
      autoFollowGymStaff(newUser.id); // non-blocking
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email: email_, code } = req.body;
    const user = await User.findOne({ where: { email: email_ } });
    if (!user) return res.status(404).json({ message: 'Aucun compte avec cet email' });

    if (user.isEmailVerified) {
      const token = generateToken(user);
      const { passwordHash: _, emailVerificationCode: __, emailVerificationExpiry: ___, passwordResetCode: ____, passwordResetExpiry: _____, ...userOut } = user.toJSON();
      return res.json({ token, user: userOut });
    }

    if (user.emailVerificationCode !== code || new Date() > new Date(user.emailVerificationExpiry)) {
      return res.status(400).json({ message: 'Code invalide ou expiré' });
    }

    await user.update({ isEmailVerified: true, emailVerificationCode: null, emailVerificationExpiry: null });
    const token = generateToken(user);
    const { passwordHash: _, emailVerificationCode: __, emailVerificationExpiry: ___, passwordResetCode: ____, passwordResetExpiry: _____, ...userOut } = user.toJSON();
    res.json({ token, user: userOut });

    email.sendWelcome({ firstName: user.firstName, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email: email_ } = req.body;
    const user = await User.findOne({ where: { email: email_ } });
    if (!user) return res.status(404).json({ message: 'Aucun compte avec cet email' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email déjà vérifié' });

    const code = randomCode();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.update({ emailVerificationCode: code, emailVerificationExpiry: codeExpiry });
    email.sendVerificationCode({ firstName: user.firstName, email: user.email, code });
    res.json({ message: 'Code renvoyé. Vérifiez votre email.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email: email_, password } = req.body;
    const user = await User.findOne({ where: { email: email_ } });
    if (!user) return res.status(401).json({ message: 'Identifiants incorrects' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Identifiants incorrects' });

    if (!user.isEmailVerified) {
      // Auto-verify users created before email verification was implemented
      if (!user.emailVerificationCode) {
        await user.update({ isEmailVerified: true });
      } else {
        return res.status(403).json({
          message: 'Vérifiez votre email avant de vous connecter',
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email,
        });
      }
    }

    await user.update({ lastLoginAt: new Date() });
    const token = generateToken(user);
    const { passwordHash: _, emailVerificationCode: __, emailVerificationExpiry: ___, passwordResetCode: ____, passwordResetExpiry: _____, ...userOut } = user.toJSON();
    res.json({ token, user: userOut });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email: email_ } = req.body;
    const user = await User.findOne({ where: { email: email_ } });
    if (!user) return res.status(404).json({ message: 'Aucun compte avec cet email' });

    const code = randomCode();
    const codeExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.update({ passwordResetCode: code, passwordResetExpiry: codeExpiry });
    email.sendPasswordReset({ firstName: user.firstName, email: user.email, code });
    res.json({ message: 'Code envoyé sur votre email' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email: email_, code, newPassword } = req.body;
    const user = await User.findOne({ where: { email: email_ } });
    if (!user) return res.status(404).json({ message: 'Aucun compte avec cet email' });

    if (user.passwordResetCode !== code || new Date() > new Date(user.passwordResetExpiry)) {
      return res.status(400).json({ message: 'Code invalide ou expiré' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Mot de passe trop court (6 caractères min)' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await user.update({ passwordHash, passwordResetCode: null, passwordResetExpiry: null });
    res.json({ message: 'Mot de passe réinitialisé avec succès' });

    email.sendPasswordChanged({ firstName: user.firstName, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash', 'emailVerificationCode', 'emailVerificationExpiry', 'passwordResetCode', 'passwordResetExpiry'] },
      include: [
        { association: 'subscriptions', where: { status: 'actif' }, required: false },
        { association: 'gymMemberships', required: false },
      ],
    });

    const userData = user.toJSON();
    let membership = (userData.gymMemberships || [])[0] || null;

    // Auto-enroll existing users who have no membership yet
    if (!membership) {
      const defaultGym = await Gym.findOne({ where: { isDefault: true } });
      if (defaultGym) {
        const [mem] = await GymMembership.findOrCreate({
          where: { gymId: defaultGym.id, userId: user.id },
          defaults: { status: user.role === 'admin' || user.role === 'coach' ? 'approved' : 'pending' },
        });
        membership = mem.toJSON();
        autoFollowGymStaff(user.id); // non-blocking
      }
    } else {
      // Ensure existing members still follow gym staff (idempotent)
      autoFollowGymStaff(user.id);
    }

    userData.gymMembership = membership ? { status: membership.status, gymId: membership.gymId, id: membership.id } : null;
    delete userData.gymMemberships;
    res.json(userData);
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
    const { fitnessGoal, coachPreference, bodyType, experienceLevel, ...extra } = req.body;
    const surveyData = { fitnessGoal, coachPreference, bodyType, experienceLevel, ...extra };

    // Generate plan synchronously (pure JS, no external API)
    let aiPlan = null;
    try {
      aiPlan = JSON.stringify(generateFitnessPlan(req.user, surveyData));
    } catch (e) {
      console.error('Plan generation failed:', e.message);
    }

    await req.user.update({ fitnessGoal, coachPreference, bodyType, experienceLevel, surveyCompleted: true, aiPlan });
    const { passwordHash: _, ...userOut } = req.user.toJSON();
    res.json({ ...userOut, aiPlan });
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
