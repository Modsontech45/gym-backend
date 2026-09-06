const router = require('express').Router();
const c = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.post('/register', c.register);
router.post('/verify-email', c.verifyEmail);
router.post('/resend-verification', c.resendVerification);
router.post('/login', c.login);
router.post('/forgot-password', c.forgotPassword);
router.post('/reset-password', c.resetPassword);
router.get('/me', authenticate, c.me);
router.put('/profile', authenticate, uploadAvatar.single('avatar'), c.updateProfile);
router.put('/password', authenticate, c.changePassword);
router.post('/survey', authenticate, c.saveSurvey);

module.exports = router;
