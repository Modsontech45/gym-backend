const router = require('express').Router();
const c = require('../controllers/workoutController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/my', authenticate, c.getClientPrograms);
router.get('/client/:clientId', authenticate, requireRole('admin', 'coach'), c.getClientPrograms);
router.post('/programs', authenticate, requireRole('admin', 'coach'), c.createProgram);
router.get('/programs/:id', authenticate, c.getProgramDetail);
router.put('/programs/:id', authenticate, requireRole('admin', 'coach'), c.updateProgram);
router.delete('/programs/:id', authenticate, requireRole('admin', 'coach'), c.deleteProgram);
router.post('/sessions', authenticate, requireRole('admin', 'coach'), c.addSession);
router.put('/sessions/:id', authenticate, requireRole('admin', 'coach'), c.updateSession);
router.delete('/sessions/:id', authenticate, requireRole('admin', 'coach'), c.deleteSession);
router.post('/exercises', authenticate, requireRole('admin', 'coach'), c.addExercise);
router.put('/exercises/:id', authenticate, requireRole('admin', 'coach'), c.updateExercise);
router.delete('/exercises/:id', authenticate, requireRole('admin', 'coach'), c.deleteExercise);
router.post('/log', authenticate, c.logSession);
router.get('/logs', authenticate, c.getSessionLogs);
router.get('/logs/:userId', authenticate, requireRole('admin', 'coach'), c.getSessionLogs);

module.exports = router;
