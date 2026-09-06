const router = require('express').Router();
const c = require('../controllers/followUpController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, c.getFollowUps);
router.post('/', authenticate, requireRole('admin', 'coach'), c.createFollowUp);
router.put('/:id', authenticate, requireRole('admin', 'coach'), c.updateFollowUp);
router.delete('/:id', authenticate, requireRole('admin', 'coach'), c.deleteFollowUp);

module.exports = router;
