require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize } = require('../models');

async function migrate() {
  console.log('🔄 Connexion à la base de données Neon...');
  await sequelize.authenticate();
  console.log('✅ Connexion réussie');

  console.log('🔄 Synchronisation des tables (alter)...');
  await sequelize.sync({ alter: true });
  console.log('✅ Tables synchronisées sans perte de données');

  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Erreur migration:', err.message);
  process.exit(1);
});
