require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const {
  sequelize, User, Subscription, Post, PostComment, PostLike,
  WorkoutProgram, WorkoutSession, Exercise, Measurement, FollowUp, Message, Notification,
  Gym, GymMembership, MembershipPackage, GymProgram, Follow,
} = require('../models');

async function seed() {
  await sequelize.sync({ force: true });

  const adminHash  = await bcrypt.hash('Admin2024!', 12);
  const coachHash  = await bcrypt.hash('Coach2024!', 12);
  const clientHash = await bcrypt.hash('Client2024!', 12);

  // ── Users ────────────────────────────────────────────────────────────────────
  const admin = await User.create({
    firstName: 'Admin', lastName: 'Yunfit', email: 'admin@yunfit.fr',
    passwordHash: adminHash, role: 'admin', language: 'fr', surveyCompleted: true, isEmailVerified: true,
  });

  const coach = await User.create({
    firstName: 'Jean', lastName: 'Dupont', email: 'coach@yunfit.fr',
    passwordHash: coachHash, role: 'coach', language: 'fr', surveyCompleted: true, isEmailVerified: true,
    bio: 'Coach certifié avec 10 ans d\'expérience en musculation et fitness.',
    experienceLevel: 'expert',
  });

  const client1 = await User.create({
    firstName: 'Marie', lastName: 'Martin', email: 'marie@example.fr',
    passwordHash: clientHash, role: 'client', language: 'fr',
    fitnessGoal: 'Perte de poids', experienceLevel: 'debutant',
    bodyType: 'endomorphe', coachPreference: 'coach', surveyCompleted: true, isEmailVerified: true,
    bio: 'Motivée et déterminée !', location: 'Paris',
  });

  const client2 = await User.create({
    firstName: 'Pierre', lastName: 'Bernard', email: 'pierre@example.fr',
    passwordHash: clientHash, role: 'client', language: 'fr',
    fitnessGoal: 'Prise de masse', experienceLevel: 'intermediaire',
    bodyType: 'ectomorphe', coachPreference: 'coach', surveyCompleted: true, isEmailVerified: true,
    bio: 'Passionné de musculation depuis 3 ans.', location: 'Lyon',
  });

  // ── Subscriptions ─────────────────────────────────────────────────────────────
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

  // ── Posts ─────────────────────────────────────────────────────────────────────
  const post1 = await Post.create({
    userId: coach.id, postType: 'motivation', isPublic: true, likesCount: 4, commentsCount: 1,
    content: '💪 Nouvelle semaine, nouveaux objectifs ! Rappellez-vous : la régularité est la clé du succès. Chaque séance compte, même les jours sans motivation. On y va ensemble !',
  });

  const post2 = await Post.create({
    userId: client1.id, postType: 'progress', isPublic: true, likesCount: 6, commentsCount: 2,
    content: 'Première séance complète sans m\'arrêter ! Je n\'aurais jamais cru ça possible il y a 3 semaines. Merci Jean pour le programme parfaitement adapté 🙏',
  });

  const post3 = await Post.create({
    userId: client2.id, postType: 'workout', isPublic: true, likesCount: 3, commentsCount: 1,
    content: 'Séance pectoraux terminée. 4×10 développé couché à 80kg. On monte progressivement 💪🏋️',
  });

  const post4 = await Post.create({
    userId: coach.id, postType: 'achievement', isPublic: true, likesCount: 8, commentsCount: 2,
    content: '🏆 Félicitations à Marie Martin qui vient de perdre ses premiers 3 kilos en 3 semaines de programme ! Un travail remarquable, persévère !',
  });

  const post5 = await Post.create({
    userId: client1.id, postType: 'general', isPublic: true, likesCount: 2, commentsCount: 0,
    content: 'Récupération active aujourd\'hui — balade de 45 min et étirements. Mon corps me remercie déjà 😅',
  });

  // Post likes
  await PostLike.create({ postId: post1.id, userId: client1.id });
  await PostLike.create({ postId: post1.id, userId: client2.id });
  await PostLike.create({ postId: post1.id, userId: admin.id });
  await PostLike.create({ postId: post2.id, userId: coach.id });
  await PostLike.create({ postId: post2.id, userId: client2.id });
  await PostLike.create({ postId: post4.id, userId: client1.id });
  await PostLike.create({ postId: post4.id, userId: client2.id });

  // Post comments
  await PostComment.create({ postId: post1.id, userId: client1.id, content: 'Merci coach ! Séance du matin faite, objectif atteint 💪' });
  await PostComment.create({ postId: post2.id, userId: coach.id, content: 'Bravo Marie ! C\'est exactement l\'état d\'esprit qu\'il faut. Continue comme ça !' });
  await PostComment.create({ postId: post2.id, userId: client2.id, content: '@Marie Martin Super progrès ! La constance paie toujours 👏' });
  await PostComment.create({ postId: post3.id, userId: coach.id, content: 'Parfait Pierre ! La semaine prochaine on passe à 85kg 🎯' });
  await PostComment.create({ postId: post4.id, userId: client1.id, content: 'Merci Jean, ça me motive encore plus ! 🥹' });
  await PostComment.create({ postId: post4.id, userId: client2.id, content: 'GG Marie !' });

  // ── Workout Programs ──────────────────────────────────────────────────────────
  const prog1 = await WorkoutProgram.create({
    clientId: client1.id, coachId: coach.id,
    name: 'Programme Perte de Poids — Marie',
    description: 'Combinaison cardio + musculation pour brûler les graisses tout en préservant la masse musculaire.',
    goal: 'Perte de poids', durationWeeks: 12, frequencyPerWeek: 4, isActive: true,
  });

  const sess1 = await WorkoutSession.create({
    programId: prog1.id, name: 'Cardio & Jambes', dayOfWeek: 'lundi',
    durationMinutes: 50, muscleGroups: ['quadriceps', 'ischio-jambiers', 'fessiers'],
  });
  await Exercise.create({ sessionId: sess1.id, name: 'Squat goblet', sets: 3, reps: 15, restSeconds: 60, order: 1 });
  await Exercise.create({ sessionId: sess1.id, name: 'Fentes marchées', sets: 3, reps: 12, restSeconds: 60, order: 2 });
  await Exercise.create({ sessionId: sess1.id, name: 'Tapis de course', sets: 1, reps: 1, restSeconds: 0, order: 3, notes: '20 min à 7 km/h' });

  const sess2 = await WorkoutSession.create({
    programId: prog1.id, name: 'Haut du corps', dayOfWeek: 'mercredi',
    durationMinutes: 45, muscleGroups: ['pectoraux', 'épaules', 'triceps'],
  });
  await Exercise.create({ sessionId: sess2.id, name: 'Développé couché haltères', sets: 3, reps: 12, restSeconds: 75, order: 1 });
  await Exercise.create({ sessionId: sess2.id, name: 'Élévations latérales', sets: 3, reps: 15, restSeconds: 60, order: 2 });
  await Exercise.create({ sessionId: sess2.id, name: 'Pompes', sets: 3, reps: 10, restSeconds: 60, order: 3 });

  const sess3 = await WorkoutSession.create({
    programId: prog1.id, name: 'Cardio HIIT', dayOfWeek: 'vendredi',
    durationMinutes: 35, muscleGroups: ['cardio', 'full body'],
  });
  await Exercise.create({ sessionId: sess3.id, name: 'Burpees', sets: 4, reps: 10, restSeconds: 30, order: 1 });
  await Exercise.create({ sessionId: sess3.id, name: 'Mountain climbers', sets: 4, reps: 20, restSeconds: 30, order: 2 });
  await Exercise.create({ sessionId: sess3.id, name: 'Sauts à la corde', sets: 4, reps: 1, restSeconds: 30, order: 3, notes: '45 secondes' });

  const prog2 = await WorkoutProgram.create({
    clientId: client2.id, coachId: coach.id,
    name: 'Prise de masse — Pierre',
    description: 'Programme hypertrophie intermédiaire sur 4 jours. Focus sur les groupes musculaires principaux.',
    goal: 'Prise de masse', durationWeeks: 16, frequencyPerWeek: 4, isActive: true,
  });

  const sess4 = await WorkoutSession.create({
    programId: prog2.id, name: 'Poussée (Chest/Triceps)', dayOfWeek: 'lundi',
    durationMinutes: 60, muscleGroups: ['pectoraux', 'triceps', 'épaules'],
  });
  await Exercise.create({ sessionId: sess4.id, name: 'Développé couché barre', sets: 4, reps: 8, restSeconds: 120, weight: '80kg', order: 1 });
  await Exercise.create({ sessionId: sess4.id, name: 'Développé incliné haltères', sets: 4, reps: 10, restSeconds: 90, weight: '30kg', order: 2 });
  await Exercise.create({ sessionId: sess4.id, name: 'Dips', sets: 3, reps: 12, restSeconds: 90, order: 3 });

  const sess5 = await WorkoutSession.create({
    programId: prog2.id, name: 'Traction (Back/Biceps)', dayOfWeek: 'mardi',
    durationMinutes: 60, muscleGroups: ['dorsaux', 'biceps', 'trapèzes'],
  });
  await Exercise.create({ sessionId: sess5.id, name: 'Tractions', sets: 4, reps: 8, restSeconds: 120, order: 1 });
  await Exercise.create({ sessionId: sess5.id, name: 'Rowing barre', sets: 4, reps: 10, restSeconds: 90, weight: '70kg', order: 2 });
  await Exercise.create({ sessionId: sess5.id, name: 'Curl biceps haltères', sets: 3, reps: 12, restSeconds: 60, weight: '16kg', order: 3 });

  // ── Measurements ──────────────────────────────────────────────────────────────
  await Measurement.create({
    userId: client1.id, weight: 68.5, height: 165, bodyFat: 28.0, muscleMass: 42.0,
    waist: 82, hips: 98, chest: 90, arms: 28, measuredAt: '2026-08-01',
    notes: 'Mesures initiales avant programme',
  });
  await Measurement.create({
    userId: client1.id, weight: 66.8, height: 165, bodyFat: 26.5, muscleMass: 42.8,
    waist: 79, hips: 96, chest: 89, arms: 28.5, measuredAt: '2026-09-01',
    notes: '1 mois de programme — bons résultats !',
  });

  await Measurement.create({
    userId: client2.id, weight: 75.0, height: 180, bodyFat: 14.0, muscleMass: 60.0,
    waist: 80, chest: 100, arms: 36, measuredAt: '2026-08-01',
    notes: 'Début du programme masse',
  });
  await Measurement.create({
    userId: client2.id, weight: 77.2, height: 180, bodyFat: 13.5, muscleMass: 62.5,
    waist: 81, chest: 102, arms: 37.5, measuredAt: '2026-09-01',
    notes: 'Premier mois : +2.2kg, dont +2.5kg de masse musculaire 💪',
  });

  // ── Follow-ups ────────────────────────────────────────────────────────────────
  await FollowUp.create({
    coachId: coach.id, clientId: client1.id,
    title: 'Bilan mensuel Marie', type: 'bilan',
    scheduledDate: '2026-09-10', status: 'planifie', priority: 'normale',
    notes: 'Vérifier les progrès, ajuster le programme si nécessaire.',
  });
  await FollowUp.create({
    coachId: coach.id, clientId: client2.id,
    title: 'Ajustement programme Pierre', type: 'appel',
    scheduledDate: '2026-09-08', status: 'planifie', priority: 'haute',
    notes: 'Pierre signale une douleur au coude. Vérifier les charges et la technique.',
  });
  await FollowUp.create({
    coachId: coach.id, clientId: client1.id,
    title: 'Point nutrition', type: 'message',
    scheduledDate: '2026-08-25', status: 'complete', priority: 'normale',
    notes: 'Revu le plan alimentaire, réduction des glucides le soir.',
  });

  // ── Messages ──────────────────────────────────────────────────────────────────
  await Message.create({ senderId: coach.id, receiverId: client1.id, content: 'Bonjour Marie ! Comment vous sentez-vous après la première semaine ?', isRead: true });
  await Message.create({ senderId: client1.id, receiverId: coach.id, content: 'Bonjour Jean ! Ça se passe très bien, je suis un peu courbaturée mais motivée 😊', isRead: true });
  await Message.create({ senderId: coach.id, receiverId: client1.id, content: 'C\'est normal ! Les courbatures montrent que les muscles travaillent. Continuez, vous êtes sur la bonne voie !', isRead: true });
  await Message.create({ senderId: client1.id, receiverId: coach.id, content: 'Merci pour l\'encouragement. À demain pour la séance !', isRead: false });

  await Message.create({ senderId: coach.id, receiverId: client2.id, content: 'Pierre, on passe à 85kg au développé couché la semaine prochaine. Vous êtes prêt ?', isRead: true });
  await Message.create({ senderId: client2.id, receiverId: coach.id, content: 'Oui coach ! J\'ai senti que 80kg commençait à devenir plus facile 💪', isRead: false });

  // ── Notifications ─────────────────────────────────────────────────────────────
  await Notification.create({
    userId: client1.id, type: 'post_like', title: 'Nouveau j\'aime',
    body: 'Jean Dupont a aimé votre publication', isRead: false,
  });
  await Notification.create({
    userId: client1.id, type: 'post_comment', title: 'Nouveau commentaire',
    body: 'Jean Dupont a commenté votre publication', isRead: false,
  });
  await Notification.create({
    userId: client2.id, type: 'follow_up', title: 'Suivi planifié',
    body: 'Votre coach a planifié un suivi pour le 08/09', isRead: false,
  });

  // ── Default Gym ───────────────────────────────────────────────────────────────
  const gym = await Gym.create({
    name: 'Yunfit Dakar',
    description: 'Votre salle de sport moderne au cœur de Dakar. Équipements haut de gamme, coachs certifiés.',
    location: 'Dakar, Sénégal',
    phone: '+221 33 XXX XX XX',
    email: 'contact@yunfit.fr',
    ownerId: admin.id,
    isDefault: true,
  });

  // ── Membership packages ───────────────────────────────────────────────────────
  await MembershipPackage.create({
    gymId: gym.id, name: 'Journée', description: 'Accès 1 journée complète',
    price: 7000, durationDays: 1, sortOrder: 0,
    features: ['Accès à toutes les machines', 'Vestiaires & douches'],
  });
  await MembershipPackage.create({
    gymId: gym.id, name: 'Mensuel', description: 'Abonnement 1 mois',
    price: 30000, durationDays: 30, sortOrder: 1,
    features: ['Accès illimité', 'Vestiaires & douches', 'Cours collectifs'],
  });
  await MembershipPackage.create({
    gymId: gym.id, name: 'Trimestriel', description: 'Abonnement 3 mois',
    price: 75000, durationDays: 90, sortOrder: 2,
    features: ['Accès illimité', 'Vestiaires & douches', 'Cours collectifs', '1 bilan coach offert'],
  });
  await MembershipPackage.create({
    gymId: gym.id, name: 'Annuel', description: 'Abonnement 1 an — Meilleur prix',
    price: 240000, durationDays: 365, sortOrder: 3,
    features: ['Accès illimité', 'Vestiaires & douches', 'Cours collectifs', 'Bilans coach mensuels', 'Programme personnalisé offert'],
  });

  // ── Auto-approve all existing users ──────────────────────────────────────────
  for (const user of [admin, coach, client1, client2]) {
    await GymMembership.create({ gymId: gym.id, userId: user.id, status: 'approved', approvedAt: new Date(), approvedBy: admin.id });
  }

  // ── Follow relationships ──────────────────────────────────────────────────────
  await Follow.create({ followerId: client1.id, followingId: coach.id });
  await Follow.create({ followerId: client2.id, followingId: coach.id });
  await Follow.create({ followerId: client1.id, followingId: client2.id });
  await Follow.create({ followerId: coach.id, followingId: client1.id });
  await Follow.create({ followerId: coach.id, followingId: client2.id });

  // ── Gym program catalog ───────────────────────────────────────────────────────
  await GymProgram.create({
    gymId: gym.id, coachId: coach.id,
    title: 'Perte de poids — 8 semaines', category: 'cardio', difficulty: 'debutant',
    durationWeeks: 8, frequencyPerWeek: 4, isPublished: true, enrollCount: 12,
    description: 'Programme complet alliant cardio et renforcement musculaire pour brûler les graisses efficacement.',
    sessions: [
      { name: 'Cardio HIIT', dayOfWeek: 'lundi', exercises: [{ name: 'Burpees', sets: 4, reps: 10 }, { name: 'Mountain climbers', sets: 4, reps: 20 }] },
      { name: 'Renfo bas du corps', dayOfWeek: 'mercredi', exercises: [{ name: 'Squats', sets: 3, reps: 15 }, { name: 'Fentes', sets: 3, reps: 12 }] },
    ],
  });
  await GymProgram.create({
    gymId: gym.id, coachId: coach.id,
    title: 'Prise de masse — 12 semaines', category: 'muscu', difficulty: 'intermediaire',
    durationWeeks: 12, frequencyPerWeek: 4, isPublished: true, enrollCount: 8,
    description: 'Programme hypertrophie structuré pour gagner en masse musculaire de façon optimale.',
    sessions: [
      { name: 'Push (Poitrine/Épaules/Triceps)', dayOfWeek: 'lundi', exercises: [{ name: 'Développé couché', sets: 4, reps: 8 }] },
      { name: 'Pull (Dos/Biceps)', dayOfWeek: 'mardi', exercises: [{ name: 'Tractions', sets: 4, reps: 8 }] },
    ],
  });
  await GymProgram.create({
    gymId: gym.id, coachId: coach.id,
    title: 'Yoga & Souplesse', category: 'yoga', difficulty: 'debutant',
    durationWeeks: 6, frequencyPerWeek: 3, isPublished: true, enrollCount: 5,
    description: 'Programme de yoga et étirements pour améliorer la souplesse et la récupération.',
    sessions: [],
  });

  console.log('\n✅ Données de test créées avec succès\n');
  console.log('─────────────────────────────────────────');
  console.log('Admin:   admin@yunfit.fr  / Admin2024!');
  console.log('Coach:   coach@yunfit.fr  / Coach2024!');
  console.log('Client:  marie@example.fr / Client2024!');
  console.log('Client:  pierre@example.fr / Client2024!');
  console.log('─────────────────────────────────────────\n');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
