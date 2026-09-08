const sequelize = require('./database');

(async () => {
  try {
    // Add 'en_attente' to the existing ENUM if not present
    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'en_attente'
            AND enumtypid = (
              SELECT oid FROM pg_type WHERE typname = 'enum_subscriptions_status'
            )
        ) THEN
          ALTER TYPE "enum_subscriptions_status" ADD VALUE 'en_attente' BEFORE 'actif';
        END IF;
      END
      $$;
    `);
    console.log('Migration done: en_attente added to enum_subscriptions_status');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await sequelize.close();
  }
})();
