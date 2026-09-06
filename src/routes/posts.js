const router = require('express').Router();
const c = require('../controllers/postController');
const { authenticate, requireRole } = require('../middleware/auth');
const { uploadPost } = require('../middleware/upload');

router.get('/feed', authenticate, c.getFeed);
router.post('/', authenticate, uploadPost.single('media'), c.createPost);
router.delete('/:id', authenticate, c.deletePost);
router.post('/:id/like', authenticate, c.likePost);
router.get('/:id/comments', authenticate, c.getComments);
router.post('/:id/comments', authenticate, c.addComment);

module.exports = router;
