const router = require('express').Router();
const c = require('../controllers/appointmentController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, c.getMyAppointments);
router.post('/', authenticate, c.createAppointment);
router.put('/:id', authenticate, c.updateAppointment);
router.delete('/:id', authenticate, c.deleteAppointment);

module.exports = router;
