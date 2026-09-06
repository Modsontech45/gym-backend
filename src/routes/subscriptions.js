const router = require('express').Router();
const c = require('../controllers/subscriptionController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/my', authenticate, c.mySubscriptions);
router.get('/', authenticate, requireRole('admin', 'coach'), c.getAllSubscriptions);
router.get('/client/:clientId', authenticate, requireRole('admin', 'coach'), c.getClientSubscriptions);
router.post('/', authenticate, requireRole('admin', 'coach'), c.createSubscription);
router.put('/:id', authenticate, requireRole('admin', 'coach'), c.updateSubscription);
router.post('/:id/credit', authenticate, requireRole('admin', 'coach'), c.creditBalance);

module.exports = router;
