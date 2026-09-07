const router = require('express').Router();
const c = require('../controllers/gymController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public gym info
router.get('/', authenticate, c.getDefaultGym);
router.put('/', authenticate, requireRole('admin'), c.updateGym);

// Membership packages
router.get('/packages', authenticate, c.getPackages);
router.post('/packages', authenticate, requireRole('admin'), c.createPackage);
router.put('/packages/:id', authenticate, requireRole('admin'), c.updatePackage);
router.delete('/packages/:id', authenticate, requireRole('admin'), c.deletePackage);

// Member requests
router.post('/membership/request', authenticate, c.requestMembership);
router.get('/membership/me', authenticate, c.getMyMembership);

// Admin membership management
router.get('/membership/pending', authenticate, requireRole('admin', 'coach'), c.getPendingRequests);
router.get('/membership/all', authenticate, requireRole('admin', 'coach'), c.getAllMembers);
router.put('/membership/:id/review', authenticate, requireRole('admin', 'coach'), c.reviewMembership);

module.exports = router;
