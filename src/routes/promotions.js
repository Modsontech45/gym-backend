const router = require('express').Router();
const c = require('../controllers/promotionController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, requireRole('admin', 'coach'), c.getAll);
router.get('/active', authenticate, requireRole('admin', 'coach'), c.getActive);
router.get('/validate/:code', authenticate, c.validate);
router.post('/', authenticate, requireRole('admin', 'coach'), c.create);
router.put('/:id', authenticate, requireRole('admin', 'coach'), c.update);
router.put('/:id/toggle', authenticate, requireRole('admin', 'coach'), c.toggle);
router.delete('/:id', authenticate, requireRole('admin'), c.remove);

module.exports = router;
