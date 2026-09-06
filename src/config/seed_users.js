require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User, Subscription } = require('../models');

async function seed() {
  await sequelize.authenticate();
  console.log('✅ Connecté à Neon');

  const password = 'Mymoney12@';
  const hash = await bcrypt.hash(password, 12);

  // Coach / Admin
  const [coach, coachCreated] = await User.findOrCreate({
    where: { email: 'operals.tech@gmail.com' },
    defaults: {
      firstName: 'Admin',
      lastName: 'Coach',
      email: 'operals.tech@gmail.com',
      passwordHash: hash,
      role: 'admin',
      language: 'fr',
      isActive: true,
    },
  });

  if (!coachCreated) {
    await coach.update({ passwordHash: hash, role: 'admin', isActive: true });
    console.log('♻️  Coach/Admin mis à jour : operals.tech@gmail.com');
  } else {
    console.log('✅ Coach/Admin créé   : operals.tech@gmail.com');
  }

  // Client
  const [client, clientCreated] = await User.findOrCreate({
    where: { email: 'tandemodson41@gmail.com' },
    defaults: {
      firstName: 'Tandem',
      lastName: 'Odson',
      email: 'tandemodson41@gmail.com',
      passwordHash: hash,
      role: 'client',
      language: 'fr',
      isActive: true,
    },
  });

  if (!clientCreated) {
    await client.update({ passwordHash: hash, role: 'client', isActive: true });
    console.log('♻️  Client mis à jour  : tandemodson41@gmail.com');
  } else {
    console.log('✅ Client créé        : tandemodson41@gmail.com');
  }

  // Abonnement de bienvenue pour le client
  const existingSub = await Subscription.findOne({ where: { userId: client.id, status: 'actif' } });
  if (!existingSub) {
    await Subscription.create({
      userId: client.id,
      planName: 'Mensuel Standard',
      planType: 'mensuel',
      price: 25000,
      balance: 25000,
      sessionsIncluded: 12,
      sessionsUsed: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'actif',
    });
    console.log('✅ Abonnement créé pour le client');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Comptes créés dans neondb');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Admin/Coach : operals.tech@gmail.com');
  console.log('  Client      : tandemodson41@gmail.com');
  console.log('  Mot de passe: Mymoney12@');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
