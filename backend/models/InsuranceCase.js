const mongoose = require('mongoose');

const insuranceCaseSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  freelancerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  insuranceProvider: { 
    type: String, 
    required: true 
  },
  policyNumber: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  documentPath: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('InsuranceCase', insuranceCaseSchema);
