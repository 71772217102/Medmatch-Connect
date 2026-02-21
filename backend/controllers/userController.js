const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFreelancers = async (req, res) => {
  try {
    const freelancers = await User.find({ role: 'freelancer' }).select('-password');
    const profiles = await FreelancerProfile.find();
    
    const freelancerData = freelancers.map(f => {
      const profile = profiles.find(p => p.userId.toString() === f._id.toString());
      return { ...f.toObject(), profile };
    });
    
    res.json(freelancerData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    let profile = null;
    
    if (user.role === 'freelancer') {
      profile = await FreelancerProfile.findOne({ userId: user._id });
    }
    
    res.json({ user, profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
