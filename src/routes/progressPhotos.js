const router = require('express').Router();
const c = require('../controllers/progressPhotoController');
const { authenticate, requireRole } = require('../middleware/auth');
const { uploadPost } = require('../middleware/upload');

const upload = uploadPost.single('photo');

router.get('/my', authenticate, c.getMyPhotos);
router.get('/client/:clientId', authenticate, requireRole('admin', 'coach'), c.getClientPhotos);
router.post('/', authenticate, upload, c.uploadPhoto);
router.delete('/:id', authenticate, c.deletePhoto);

module.exports = router;
