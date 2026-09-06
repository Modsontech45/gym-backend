const router = require('express').Router();
const c = require('../controllers/measurementController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/my', authenticate, c.getMyMeasurements);
router.get('/client/:userId', authenticate, requireRole('admin', 'coach'), c.getMyMeasurements);
router.post('/', authenticate, c.addMeasurement);
router.put('/:id', authenticate, c.updateMeasurement);
router.delete('/:id', authenticate, c.deleteMeasurement);

module.exports = router;
