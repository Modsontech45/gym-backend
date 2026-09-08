const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const sequelize = require('./database');

async function seedGym() {
  // Must require models after DB is configured
  const { Gym, User, GymMembership } = require('../models');

  await sequelize.authenticate();
  console.log('Connected to DB');

  const [gym, created] = await Gym.findOrCreate({
    where: { isDefault: true },
    defaults: {
      name: 'Amness',
      description: 'Salle de sport Amness',
      isDefault: true,
    },
  });
  console.log(`Gym "${gym.name}" (${gym.id}) — ${created ? 'created' : 'already exists'}`);

  const users = await User.findAll({ attributes: ['id', 'role'] });
  console.log(`Enrolling ${users.length} users…`);

  for (const u of users) {
    const status = ['admin', 'coach'].includes(u.role) ? 'approved' : 'pending';
    const [, wasCreated] = await GymMembership.findOrCreate({
      where: { gymId: gym.id, userId: u.id },
      defaults: { status, approvedAt: status === 'approved' ? new Date() : null },
    });
    if (wasCreated) console.log(`  Enrolled ${u.id} → ${status}`);
  }

  console.log('Seed complete.');
  process.exit(0);
}

seedGym().catch(err => { console.error(err); process.exit(1); });
