const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

// Temporary: Create admin user
router.get('/seed-admin', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@medmatch.com' });
    if (existingAdmin) {
      await User.deleteOne({ email: 'admin@medmatch.com' });
    }
    
    const hashedPassword = await bcrypt.hash('admin', 10);
    const admin = new User({
      name: 'Admin',
      email: 'admin@medmatch.com',
      password: hashedPassword,
      role: 'admin'
    });
    await admin.save();
    
    res.json({ message: 'Admin created successfully', email: 'admin@medmatch.com', password: 'admin' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
});

module.exports = router;
