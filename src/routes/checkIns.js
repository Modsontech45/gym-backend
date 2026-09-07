const router = require('express').Router();
const c = require('../controllers/checkInController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/my', authenticate, c.getMyCheckIns);
router.get('/latest', authenticate, requireRole('admin', 'coach'), c.getLatestCheckIns);
router.get('/client/:clientId', authenticate, requireRole('admin', 'coach'), c.getClientCheckIns);
router.post('/', authenticate, c.submitCheckIn);
router.put('/:id/feedback', authenticate, requireRole('admin', 'coach'), c.addCoachFeedback);

module.exports = router;
