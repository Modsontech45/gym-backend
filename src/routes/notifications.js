const router = require('express').Router();
const c = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, c.getNotifications);
router.put('/read-all', authenticate, c.markRead);
router.put('/:id/read', authenticate, c.markOneRead);

module.exports = router;
