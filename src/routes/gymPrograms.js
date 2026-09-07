const router = require('express').Router();
const c = require('../controllers/gymProgramController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, c.listPublished);
router.get('/all', authenticate, requireRole('admin', 'coach'), c.listAll);
router.get('/:id', authenticate, c.getOne);
router.post('/', authenticate, requireRole('admin', 'coach'), c.create);
router.put('/:id', authenticate, requireRole('admin', 'coach'), c.update);
router.delete('/:id', authenticate, requireRole('admin', 'coach'), c.destroy);
router.post('/:id/enroll', authenticate, c.enroll);

module.exports = router;
