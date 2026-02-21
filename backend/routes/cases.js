const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createCase,
  getMyCases,
  getAvailableCases,
  acceptCase,
  getFreelancerCases,
  updateCaseStatus,
  getAllCases,
  assignCase
} = require('../controllers/caseController');

// Patient routes
router.post('/create', auth, authorize('patient'), upload.single('document'), createCase);
router.get('/mycases', auth, authorize('patient'), getMyCases);

// Freelancer routes
router.get('/available', auth, authorize('freelancer'), getAvailableCases);
router.post('/accept/:id', auth, authorize('freelancer'), acceptCase);
router.get('/myassignments', auth, authorize('freelancer'), getFreelancerCases);
router.put('/status/:id', auth, authorize('freelancer', 'admin'), updateCaseStatus);

// Admin routes
router.get('/all', auth, authorize('admin'), getAllCases);
router.post('/assign', auth, authorize('admin'), assignCase);

module.exports = router;
