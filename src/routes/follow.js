const router = require('express').Router();
const c = require('../controllers/followController');
const { authenticate } = require('../middleware/auth');

router.get('/search', authenticate, c.searchMembers);
router.post('/:targetId', authenticate, c.follow);
router.delete('/:targetId', authenticate, c.unfollow);
router.get('/followers/:userId', authenticate, c.getFollowers);
router.get('/following/:userId', authenticate, c.getFollowing);
router.get('/followers', authenticate, c.getFollowers);
router.get('/following', authenticate, c.getFollowing);

module.exports = router;
