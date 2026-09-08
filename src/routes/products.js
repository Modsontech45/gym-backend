const router = require('express').Router();
const c = require('../controllers/productController');
const { authenticate, requireRole } = require('../middleware/auth');
const { uploadProduct } = require('../middleware/upload');

router.get('/', authenticate, c.list);
router.post('/', authenticate, requireRole('admin', 'coach'), uploadProduct.single('image'), c.create);
router.put('/:id', authenticate, requireRole('admin', 'coach'), uploadProduct.single('image'), c.update);
router.delete('/:id', authenticate, requireRole('admin', 'coach'), c.remove);

module.exports = router;
