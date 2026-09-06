require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User, Subscription } = require('../models');

async function seed() {
  await sequelize.sync({ force: true });

  const adminHash = await bcrypt.hash('Admin2024!', 12);
  const coachHash = await bcrypt.hash('Coach2024!', 12);
  const clientHash = await bcrypt.hash('Client2024!', 12);

  const admin = await User.create({
    firstName: 'Admin', lastName: 'Yunfit', email: 'admin@yunfit.fr',
    passwordHash: adminHash, role: 'admin', language: 'fr',
  });

  const coach = await User.create({
    firstName: 'Jean', lastName: 'Dupont', email: 'coach@yunfit.fr',
    passwordHash: coachHash, role: 'coach', language: 'fr',
    bio: 'Coach certifié avec 10 ans d\'expérience en musculation et fitness.',
  });

  const client1 = await User.create({
    firstName: 'Marie', lastName: 'Martin', email: 'marie@example.fr',
    passwordHash: clientHash, role: 'client', language: 'fr',
    fitnessGoal: 'Perte de poids', experienceLevel: 'debutant',
  });

  const client2 = await User.create({
    firstName: 'Pierre', lastName: 'Bernard', email: 'pierre@example.fr',
    passwordHash: clientHash, role: 'client', language: 'fr',
    fitnessGoal: 'Prise de masse', experienceLevel: 'intermediaire',
  });

  await Subscription.create({
    userId: client1.id, planName: 'Mensuel Standard', planType: 'mensuel',
    price: 49.99, balance: 49.99, sessionsIncluded: 12, sessionsUsed: 3,
    startDate: '2026-09-01', endDate: '2026-09-30', status: 'actif',
  });

  await Subscription.create({
    userId: client2.id, planName: 'Trimestriel Premium', planType: 'trimestriel',
    price: 129.99, balance: 129.99, sessionsIncluded: 40, sessionsUsed: 5,
    startDate: '2026-07-01', endDate: '2026-09-30', status: 'actif',
  });

  console.log('✅ Données de test créées');
  console.log('Admin:  admin@yunfit.fr / Admin2024!');
  console.log('Coach:  coach@yunfit.fr / Coach2024!');
  console.log('Client: marie@example.fr / Client2024!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
