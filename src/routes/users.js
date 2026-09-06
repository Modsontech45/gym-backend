const router = require('express').Router();
const c = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/stats', authenticate, requireRole('admin', 'coach'), c.getStats);
router.get('/clients', authenticate, requireRole('admin', 'coach'), c.getAllClients);
router.post('/clients', authenticate, requireRole('admin', 'coach'), c.createClient);
router.get('/clients/:id', authenticate, requireRole('admin', 'coach'), c.getClientById);
router.put('/clients/:id', authenticate, requireRole('admin', 'coach'), c.updateClient);
router.delete('/clients/:id', authenticate, requireRole('admin'), c.deleteClient);

module.exports = router;
