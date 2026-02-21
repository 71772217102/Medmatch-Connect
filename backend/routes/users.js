const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getAllUsers, getFreelancers, getProfile } = require('../controllers/userController');

router.get('/', auth, authorize('admin'), getAllUsers);
router.get('/freelancers', auth, getFreelancers);
router.get('/profile', auth, getProfile);

module.exports = router;
