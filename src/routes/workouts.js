const router = require('express').Router();
const c = require('../controllers/workoutController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/my', authenticate, c.getClientPrograms);
router.get('/client/:clientId', authenticate, requireRole('admin', 'coach'), c.getClientPrograms);
router.post('/programs', authenticate, requireRole('admin', 'coach'), c.createProgram);
router.put('/programs/:id', authenticate, requireRole('admin', 'coach'), c.updateProgram);
router.post('/sessions', authenticate, requireRole('admin', 'coach'), c.addSession);
router.post('/exercises', authenticate, requireRole('admin', 'coach'), c.addExercise);
router.post('/log', authenticate, c.logSession);
router.get('/logs', authenticate, c.getSessionLogs);
router.get('/logs/:userId', authenticate, requireRole('admin', 'coach'), c.getSessionLogs);

module.exports = router;
