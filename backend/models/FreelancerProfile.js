const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  skills: [{ 
    type: String 
  }],
  experience: { 
    type: Number, 
    default: 0 
  },
  specialization: { 
    type: String 
  },
  bio: { 
    type: String 
  },
  rating: { 
    type: Number, 
    default: 0 
  },
  completedCases: { 
    type: Number, 
    default: 0 
  }
});

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);
