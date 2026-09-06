const router = require('express').Router();
const c = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', authenticate, c.me);
router.put('/profile', authenticate, uploadAvatar.single('avatar'), c.updateProfile);
router.put('/password', authenticate, c.changePassword);

module.exports = router;
