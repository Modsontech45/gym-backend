/**
 * Fitness Plan Engine — deterministic, free, science-based.
 * Computes personalized plans using real nutrition formulas and
 * domain-encoded workout programming logic.
 */

// ── Nutrition math ──────────────────────────────────────────────────────────

function calcAge(dateOfBirth) {
  if (!dateOfBirth) return 30;
  return Math.floor((Date.now() - new Date(dateOfBirth)) / (365.25 * 24 * 3600 * 1000));
}

function calcBMR(weight, height, age, gender) {
  const w = parseFloat(weight) || 70;
  const h = parseFloat(height) || 170;
  // Mifflin-St Jeor formula (more accurate than Harris-Benedict)
  const base = 10 * w + 6.25 * h - 5 * age;
  return gender === 'femme' ? base - 161 : base + 5;
}

function calcTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentaire:       1.20,
    peu_actif:        1.375,
    moderement_actif: 1.55,
    tres_actif:       1.725,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.45));
}

function calcTargetCalories(tdee, goal, bodyType) {
  const delta = {
    perte_poids: bodyType === 'endomorphe' ? -500 : -400,
    prise_masse: bodyType === 'ectomorphe' ? 600  : 400,
    tonifier:    -200,
    force:        300,
    endurance:    100,
    maintien:       0,
  };
  return Math.max(1200, tdee + (delta[goal] ?? 0));
}

function calcMacros(calories, goal, weight) {
  const w = parseFloat(weight) || 70;
  const configs = {
    prise_masse: { protFactor: 2.2,  fatPct: 0.25 },
    force:       { protFactor: 2.4,  fatPct: 0.28 },
    perte_poids: { protFactor: 2.0,  fatPct: 0.30 },
    tonifier:    { protFactor: 1.9,  fatPct: 0.28 },
    endurance:   { protFactor: 1.5,  fatPct: 0.25 },
    maintien:    { protFactor: 1.7,  fatPct: 0.28 },
  };
  const { protFactor, fatPct } = configs[goal] ?? configs.maintien;
  const protein = Math.round(w * protFactor);
  const fat     = Math.round((calories * fatPct) / 9);
  const carbs   = Math.max(30, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { protein, fat, carbs };
}

// ── Workout programming ─────────────────────────────────────────────────────

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const SESSION_BANKS = {
  perte_poids: [
    { type: 'HIIT',         name: 'Circuit brûle-graisses', focus: 'Intervalles haute intensité' },
    { type: 'Cardio',       name: 'Cardio zone 2',          focus: 'Lipolyse et endurance de base' },
    { type: 'Musculation',  name: 'Full body léger',        focus: 'Maintien de la masse musculaire' },
    { type: 'HIIT',         name: 'Tabata 20/10',           focus: 'Afterburn — dépense post-effort' },
    { type: 'Musculation',  name: 'Circuit fonctionnel',    focus: 'Gainage et mobilité' },
  ],
  prise_masse: [
    { type: 'Musculation',  name: 'Push — Pectoraux/Épaules/Triceps', focus: 'Développé couché, OHP, dips' },
    { type: 'Musculation',  name: 'Pull — Dos/Biceps',                focus: 'Tractions, rowing, curl' },
    { type: 'Musculation',  name: 'Legs — Quadriceps/Ischio/Fessiers',focus: 'Squat, leg press, fentes' },
    { type: 'Musculation',  name: 'Haut du corps composé',            focus: 'Force et volume supérieur' },
    { type: 'Musculation',  name: 'Bas du corps & Core',              focus: 'Puissance et stabilité' },
  ],
  force: [
    { type: 'Musculation',  name: 'Squat (Force)',    focus: 'Squat barre, presse, extensions' },
    { type: 'Musculation',  name: 'Bench Press',      focus: 'Développé couché, incliné, dips lestés' },
    { type: 'Musculation',  name: 'Deadlift',         focus: 'Soulevé de terre, romanian, rowing' },
    { type: 'Musculation',  name: 'OHP & Auxiliaires',focus: 'Épaules, bras, gainage lourd' },
  ],
  endurance: [
    { type: 'Cardio',       name: 'Run long',         focus: 'Allure conversation — zone 2' },
    { type: 'Cardio',       name: 'Intervalles VO2',  focus: 'Fractionné 1min/1min' },
    { type: 'Musculation',  name: 'Renforcement fonctionnel', focus: 'Prévention blessures et stabilité' },
    { type: 'Cardio',       name: 'Cardio croisé',    focus: 'Vélo, natation ou elliptique' },
  ],
  tonifier: [
    { type: 'Musculation',  name: 'Haut du corps sculpté', focus: 'Pectoraux, épaules, bras — charges légères/reps élevées' },
    { type: 'Cardio',       name: 'Cardio doux',            focus: 'Marche rapide, vélo léger ou danse' },
    { type: 'Musculation',  name: 'Bas du corps & fessiers',focus: 'Squats sumo, hip thrust, fentes' },
    { type: 'Musculation',  name: 'Full body — Pilates',    focus: 'Gainage, posture et tonus global' },
    { type: 'Stretching',   name: 'Yoga & Mobilité',        focus: 'Flexibilité, récupération et bien-être' },
  ],
  maintien: [
    { type: 'Musculation',  name: 'Haut du corps',   focus: 'Entretien force et tonus' },
    { type: 'Cardio',       name: 'Cardio modéré',   focus: 'Santé cardiovasculaire' },
    { type: 'Musculation',  name: 'Bas du corps',    focus: 'Stabilité et équilibre musculaire' },
    { type: 'Stretching',   name: 'Récupération active', focus: 'Mobilité et prévention' },
  ],
};

function buildWeeklySchedule(goal, workoutsPerWeek, sessionDuration) {
  const n       = Math.min(7, Math.max(1, parseInt(workoutsPerWeek) || 3));
  const bank    = SESSION_BANKS[goal] ?? SESSION_BANKS.maintien;
  const durLabel = { 30: '30 min', 45: '45 min', 60: '1h00', 90: '1h30' }[parseInt(sessionDuration)] || '45 min';

  // Build REST scaffold
  const schedule = DAYS.map(d => ({ day: d, type: 'Repos', name: null, duration: null, focus: null }));

  // Spread n workout days as evenly as possible across the week
  const spread = [];
  const step = 7 / n;
  for (let i = 0; i < n; i++) spread.push(Math.round(i * step) % 7);
  const sorted = [...new Set(spread)].sort((a, b) => a - b);

  sorted.forEach((dayIdx, i) => {
    const session = bank[i % bank.length];
    schedule[dayIdx] = { day: DAYS[dayIdx], type: session.type, name: session.name, duration: durLabel, focus: session.focus };
  });

  // Insert recovery day on Saturday when volume ≥ 4 days
  if (n >= 4 && schedule[5].type === 'Repos') {
    schedule[5] = { day: 'Samedi', type: 'Repos actif', name: 'Marche ou natation légère', duration: '30 min', focus: 'Récupération active — lipolyse et mobilité' };
  }

  return schedule;
}

// ── Nutrition plan ───────────────────────────────────────────────────────────

const FOOD_DB = {
  // [diet][role] → array of options (selected deterministically by user hash)
  protein: {
    default:    ['Poulet grillé 150g', 'Saumon 150g', 'Thon au naturel 120g', 'Blanc de dinde 150g', 'Viande rouge maigre 120g', 'Crevettes 150g'],
    vegetarien: ['Œufs entiers 3', 'Fromage blanc 0% 200g', 'Tofu ferme 150g', 'Tempeh 130g', 'Lentilles cuites 200g', 'Fromage cottage 200g'],
    vegan:      ['Tofu ferme 180g', 'Tempeh 150g', 'Lentilles cuites 200g', 'Pois chiches cuits 200g', 'Seitan 120g', 'Edamame 150g'],
    keto:       ['Saumon gras 150g', 'Oeufs 3 pièces', 'Sardines à l\'huile 120g', 'Bacon maigre 80g', 'Steak 150g', 'Thon à l\'huile 120g'],
    sans_gluten:['Poulet grillé 150g', 'Saumon 150g', 'Thon 120g', 'Oeufs 3 pièces', 'Crevettes 150g', 'Lentilles 200g'],
  },
  carb: {
    default:    ['Riz complet 80g cuit', 'Flocons d\'avoine 60g', 'Quinoa 80g cuit', 'Patate douce 150g', 'Pain complet 2 tranches', 'Pâtes complètes 80g'],
    vegetarien: ['Flocons d\'avoine 60g', 'Quinoa 80g', 'Patate douce 150g', 'Pain complet 2 tranches', 'Riz brun 80g', 'Orge 80g'],
    vegan:      ['Riz brun 80g cuit', 'Flocons d\'avoine 60g', 'Quinoa 80g', 'Patate douce 150g', 'Pain de seigle 2 tranches', 'Millet 80g'],
    keto:       ['Avocat ½', 'Noix de macadamia 30g', 'Noix de coco râpée 20g', 'Fromage 40g', 'Olive 20g', 'Amandes 25g'],
    sans_gluten:['Riz complet 80g', 'Quinoa 80g', 'Patate douce 150g', 'Flocons de sarrasin 60g', 'Polenta 80g', 'Amarante 80g'],
  },
  veg: [
    'Épinards poêlés',  'Brocoli vapeur', 'Salade verte', 'Courgettes rôties',
    'Haricots verts',   'Poivrons sautés', 'Carottes râpées', 'Chou-fleur rôti',
    'Asperges vapeur',  'Tomates cerises',
  ],
  fat: [
    'Huile d\'olive 1 cs', 'Avocat ½', 'Amandes 20g', 'Noix 20g',
    'Beurre de cacahuète 1 cs', 'Graines de lin 1 cs', 'Huile de coco ½ cs',
  ],
};

function selectFood(arr, seed, offset = 0) {
  return arr[(seed + offset) % arr.length];
}

function buildMealPlan(calories, macros, dietType, preferredTime, goal, seed) {
  const s      = seed % 100;
  const pArr   = FOOD_DB.protein[dietType] ?? FOOD_DB.protein.default;
  const cArr   = FOOD_DB.carb[dietType]    ?? FOOD_DB.carb.default;
  const vArr   = FOOD_DB.veg;
  const fArr   = FOOD_DB.fat;
  const isKeto = dietType === 'keto';

  const bk  = Math.round(calories * 0.25);
  const sn1 = Math.round(calories * 0.10);
  const ln  = Math.round(calories * 0.30);
  const sn2 = Math.round(calories * 0.10);
  const dn  = calories - bk - sn1 - ln - sn2;

  let bkTime = '07:00', sn1Time = '10:30', lnTime = '13:00', sn2Time = '16:30', dnTime = '19:30';
  if (preferredTime === 'matin')      { bkTime = '06:00'; sn2Time = '15:30'; dnTime = '19:00'; }
  else if (preferredTime === 'soir')  { sn2Time = '17:30'; dnTime = '20:00'; }

  const meals = isKeto
    ? [
        { time: bkTime,  name: 'Petit-déjeuner',   items: [selectFood(pArr, s, 0), 'Avocat ½', 'Fromage 30g', 'Café noir'],               calories: bk  },
        { time: sn1Time, name: 'Collation matin',   items: ['Noix 30g', 'Fromage à pâte dure 25g'],                                        calories: sn1 },
        { time: lnTime,  name: 'Déjeuner',          items: [selectFood(pArr, s, 1), selectFood(vArr, s, 0), 'Huile d\'olive 2 cs', 'Avocat ½'], calories: ln  },
        { time: sn2Time, name: 'Collation',         items: ['Amandes 25g', 'Fromage 20g'],                                                  calories: sn2 },
        { time: dnTime,  name: 'Dîner',             items: [selectFood(pArr, s, 2), selectFood(vArr, s, 1), 'Beurre 10g'],                  calories: dn  },
      ]
    : [
        { time: bkTime,  name: 'Petit-déjeuner',        items: [selectFood(cArr, s, 0), selectFood(pArr, s, 0), 'Fruit frais', 'Café ou thé vert'],    calories: bk  },
        { time: sn1Time, name: 'Collation matin',        items: ['Yaourt grec 150g', 'Amandes 20g', 'Banane ½'],                                        calories: sn1 },
        { time: lnTime,  name: 'Déjeuner',               items: [selectFood(pArr, s, 1), selectFood(cArr, s, 1), selectFood(vArr, s, 0), selectFood(fArr, s, 0)], calories: ln  },
        { time: sn2Time, name: goal === 'prise_masse' ? 'Shake post-workout' : 'Collation',
          items: goal === 'prise_masse'
            ? [`Protéines en poudre 30g`, selectFood(cArr, s, 2), 'Lait demi-écrémé 250ml']
            : [selectFood(pArr, s, 2), selectFood(cArr, s, 3), 'Légumes crus'], calories: sn2 },
        { time: dnTime,  name: 'Dîner',                  items: [selectFood(pArr, s, 3), selectFood(cArr, s, 4), selectFood(vArr, s, 2), selectFood(fArr, s, 1)], calories: dn  },
      ];

  return meals;
}

// ── Tips engine ─────────────────────────────────────────────────────────────

function generateTips(goal, experienceLevel, equipment, injuries, bodyType) {
  const pools = {
    perte_poids: [
      'Maintenez un déficit calorique de 300-500 kcal/jour — plus agressif, et vos muscles partent avec la graisse.',
      'La règle des 80/20 : l\'alimentation fait 80% du résultat en perte de poids. Ne sous-estimez pas la cuisine.',
      'Buvez 2,5L d\'eau par jour : la déshydratation ralentit le métabolisme de 3%.',
      'Ne sautez pas le petit-déjeuner riche en protéines : il réduit les envies de grignotage de 40% sur la journée.',
    ],
    prise_masse: [
      'Mangez dans les 30 minutes post-séance : c\'est la fenêtre anabolique pour optimiser la synthèse protéique.',
      'Dormez 8h minimum — 70% de la croissance musculaire se produit pendant le sommeil profond (GH).',
      'Progression : ajoutez 2,5 kg par exercice dès que vous réussissez toutes les répétitions prévues.',
      'La créatine monohydrate est le seul supplément prouvé scientifiquement pour la prise de masse.',
    ],
    force: [
      'Priorisez les exercices composés : squat, soulevé de terre, développé couché représentent 80% du travail.',
      'Reposez 3-5 minutes entre les séries lourdes pour une récupération complète du système nerveux central.',
      'La périodisation linéaire (charges progressives chaque semaine) est la méthode la plus efficace pour débuter en force.',
      'Ne négligez pas la mobilité : une épaule ou une hanche rigide plafonne vos performances sous la barre.',
    ],
    endurance: [
      'La règle 80/20 : 80% de vos séances en zone 2 (conversation aisée), 20% en haute intensité.',
      'Augmentez le volume de 10% par semaine maximum pour éviter les blessures de surmenage.',
      'Les électrolytes (sodium, potassium, magnésium) sont aussi importants que l\'hydratation pendant l\'effort.',
      'La récupération active (20 min de marche légère) accélère l\'élimination des lactates.',
    ],
    tonifier: [
      'Hautes répétitions (15-20) avec tempo lent favorisent la définition musculaire sans volume excessif.',
      'La combinaison cardio modéré + musculation est 40% plus efficace pour la tonification que l\'un ou l\'autre seul.',
      'Hydratez-vous : 2L/jour améliorent l\'élasticité musculaire et la définition visuelle.',
    ],
    maintien: [
      'Changez de programme tous les 8-12 semaines pour éviter la stagnation (principe de surcharge progressive).',
      'Écoutez votre corps : la fatigue chronique est un signal de surmenage — un jour de repos supplémentaire aide.',
      'Cinq fruits et légumes par jour + alimentation variée suffisent pour maintenir une excellente condition physique.',
    ],
  };

  const levelTips = {
    debutant:       'En tant que débutant·e, concentrez-vous sur la technique avant les charges — la progression vient naturellement dans les 3 premiers mois.',
    intermediaire:  'À votre niveau, la périodisation (alterner semaines lourdes et légères) maximisera vos gains et préviendra le plateau.',
    avance:         'Pour continuer à progresser, explorez le RPE (Rate of Perceived Exertion) et les techniques d\'intensification : drop sets, rest-pause.',
  };

  const bodyTips = {
    ectomorphe: 'Morphologie ectomorphe : ne lésinez pas sur les glucides complexes — votre métabolisme rapide les brûle vite.',
    endomorphe: 'Morphologie endomorphe : réduisez les glucides le soir et optez pour des sources à index glycémique bas.',
    mesomorphe: 'Morphologie mésomorphe : vous répondez bien à tout type d\'entraînement — profitez-en pour varier les stimuli.',
  };

  const tips = [];
  const goalPool = pools[goal] ?? pools.maintien;
  tips.push(goalPool[0], goalPool[1]);
  tips.push(levelTips[experienceLevel] ?? levelTips.debutant);

  if (bodyType && bodyTips[bodyType]) tips.push(bodyTips[bodyType]);

  if (injuries && injuries.trim().length > 10) {
    tips.push('Compte tenu de vos limitations, consultez un kinésithérapeute avant de débuter. Adaptez chaque exercice — la sécurité prime toujours sur la performance.');
  } else {
    tips.push('Mesurez vos progrès toutes les 2 semaines (photos + mensurations) — les chiffres sur la balance seuls sont trompeurs.');
  }

  return tips.slice(0, 5);
}

// ── Profile summary ─────────────────────────────────────────────────────────

function buildProfileSummary(firstName, goal, bodyType, experienceLevel, workoutsPerWeek, gender) {
  const goalFr = {
    perte_poids: 'perte de poids',
    prise_masse: 'prise de masse musculaire',
    tonifier:    'tonification',
    force:       'développement de la force',
    endurance:   'amélioration de l\'endurance',
    maintien:    'maintien de la condition physique',
  }[goal] ?? 'remise en forme';

  const levelFr = {
    debutant:       'débutant·e',
    intermediaire:  'de niveau intermédiaire',
    avance:         'avancé·e',
  }[experienceLevel] ?? 'débutant·e';

  const bodyNote = {
    ectomorphe: ' avec une morphologie ectomorphe (métabolisme rapide)',
    mesomorphe: ' avec une morphologie mésomorphe (naturellement athlétique)',
    endomorphe: ' avec une morphologie endomorphe (tendance au stockage)',
  }[bodyType] ?? '';

  const pronoun = gender === 'femme' ? 'conçu pour vous accompagner' : 'conçu pour vous accompagner';

  return `${firstName}, votre profil indique un objectif de ${goalFr}, niveau ${levelFr}${bodyNote}. Ce plan de ${workoutsPerWeek || 3} séances hebdomadaires est ${pronoun} vers vos objectifs de manière progressive et sécurisée. En suivant ce programme rigoureusement pendant 8 semaines, vous constaterez des changements mesurables.`;
}

// ── Weekly goal ─────────────────────────────────────────────────────────────

function buildWeeklyGoal(goal, tdee, targetCal, macros, workoutsPerWeek) {
  const diff = Math.abs(targetCal - tdee);
  const goals = {
    perte_poids: `Maintenir un déficit de ${diff} kcal/jour pour viser −0,5 kg cette semaine`,
    prise_masse: `Consommer ${targetCal} kcal avec ${macros.protein}g de protéines pour déclencher l\'anabolisme`,
    tonifier:    `Compléter les ${workoutsPerWeek || 3} séances et rester dans la cible de ${targetCal} kcal/jour`,
    force:       `Augmenter au moins un exercice principal de 2,5 kg vs la semaine passée`,
    endurance:   `Augmenter le volume cardio de 10% sans franchir la zone 3 (essoufflement)`,
    maintien:    `Tenir toutes les séances planifiées et respecter le plan alimentaire à 90%`,
  };
  return goals[goal] ?? `Compléter ${workoutsPerWeek || 3} séances et respecter le plan nutritionnel`;
}

// ── Main export ─────────────────────────────────────────────────────────────

function generateFitnessPlan(user, surveyData) {
  const {
    fitnessGoal, bodyType, activityLevel, experienceLevel,
    workoutsPerWeek, sessionDuration, equipment,
    preferredTime, dietType, injuries, coachPreference,
  } = surveyData;

  // Use a deterministic seed based on user data so the same user gets
  // the same food variety every time (avoids re-rolls on re-generation)
  const seed = (user.firstName?.charCodeAt(0) ?? 65) + (user.lastName?.charCodeAt(0) ?? 66);

  const age      = calcAge(user.dateOfBirth);
  const bmr      = calcBMR(user.weight, user.height, age, user.gender);
  const tdee     = calcTDEE(bmr, activityLevel);
  const calories = calcTargetCalories(tdee, fitnessGoal, bodyType);
  const macros   = calcMacros(calories, fitnessGoal, user.weight);

  const weekly_schedule  = buildWeeklySchedule(fitnessGoal, workoutsPerWeek, sessionDuration);
  const meals            = buildMealPlan(calories, macros, dietType, preferredTime, fitnessGoal, seed);
  const tips             = generateTips(fitnessGoal, experienceLevel, equipment, injuries, bodyType);
  const profile_summary  = buildProfileSummary(user.firstName, fitnessGoal, bodyType, experienceLevel, workoutsPerWeek, user.gender);
  const weekly_goal      = buildWeeklyGoal(fitnessGoal, tdee, calories, macros, workoutsPerWeek);

  return {
    profile_summary,
    weekly_schedule,
    nutrition: {
      daily_calories: calories,
      protein_g:      macros.protein,
      carbs_g:        macros.carbs,
      fat_g:          macros.fat,
      meals,
    },
    tips,
    weekly_goal,
  };
}

module.exports = { generateFitnessPlan };
