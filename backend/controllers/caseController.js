const InsuranceCase = require('../models/InsuranceCase');
const User = require('../models/User');

exports.createCase = async (req, res) => {
  try {
    const { insuranceProvider, policyNumber, description } = req.body;
    
    const newCase = new InsuranceCase({
      patientId: req.user.userId,
      insuranceProvider,
      policyNumber,
      description,
      documentPath: req.file ? req.file.path : null
    });

    await newCase.save();
    res.status(201).json({ message: 'Case created successfully', case: newCase });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMyCases = async (req, res) => {
  try {
    const cases = await InsuranceCase.find({ patientId: req.user.userId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAvailableCases = async (req, res) => {
  try {
    const cases = await InsuranceCase.find({ status: 'pending', freelancerId: null })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.acceptCase = async (req, res) => {
  try {
    const caseId = req.params.id;
    
    const insuranceCase = await InsuranceCase.findById(caseId);
    if (!insuranceCase) {
      return res.status(404).json({ message: 'Case not found' });
    }

    if (insuranceCase.status !== 'pending') {
      return res.status(400).json({ message: 'Case is no longer available' });
    }

    insuranceCase.freelancerId = req.user.userId;
    insuranceCase.status = 'assigned';
    insuranceCase.updatedAt = Date.now();
    
    await insuranceCase.save();
    res.json({ message: 'Case accepted successfully', case: insuranceCase });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFreelancerCases = async (req, res) => {
  try {
    const cases = await InsuranceCase.find({ freelancerId: req.user.userId })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const caseId = req.params.id;

    const insuranceCase = await InsuranceCase.findById(caseId);
    if (!insuranceCase) {
      return res.status(404).json({ message: 'Case not found' });
    }

    if (insuranceCase.freelancerId?.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    insuranceCase.status = status;
    insuranceCase.updatedAt = Date.now();
    await insuranceCase.save();

    res.json({ message: 'Status updated', case: insuranceCase });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllCases = async (req, res) => {
  try {
    const cases = await InsuranceCase.find()
      .populate('patientId', 'name email')
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.assignCase = async (req, res) => {
  try {
    const { caseId, freelancerId } = req.body;

    const insuranceCase = await InsuranceCase.findById(caseId);
    if (!insuranceCase) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.role !== 'freelancer') {
      return res.status(400).json({ message: 'Invalid freelancer' });
    }

    insuranceCase.freelancerId = freelancerId;
    insuranceCase.status = 'assigned';
    insuranceCase.updatedAt = Date.now();
    
    await insuranceCase.save();
    res.json({ message: 'Case assigned successfully', case: insuranceCase });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
