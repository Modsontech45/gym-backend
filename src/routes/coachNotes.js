const router = require('express').Router();
const c = require('../controllers/coachNoteController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/client/:clientId', authenticate, requireRole('admin', 'coach'), c.getClientNotes);
router.post('/', authenticate, requireRole('admin', 'coach'), c.createNote);
router.put('/:id', authenticate, requireRole('admin', 'coach'), c.updateNote);
router.delete('/:id', authenticate, requireRole('admin', 'coach'), c.deleteNote);

module.exports = router;
