const router = require('express').Router();
const c = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.get('/conversations', authenticate, c.getConversations);
router.get('/:otherId', authenticate, c.getMessages);
router.post('/', authenticate, c.sendMessage);

module.exports = router;
