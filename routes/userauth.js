const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Farmer = require('../models/farmer');

const SALT_ROUNDS = 10;

// ==============================
// SIGN UP (Register Farmer)
// ==============================
router.post('/signup', async (req, res) => {
  try {
    const {
      aadhaarNumber,
      name,
      phone,
      location,
      village,
      state,
      farmAcres,
      crop
    } = req.body;

    // Validate required login fields
    if (!aadhaarNumber || !phone) {
      return res.status(400).json({
        message: 'Aadhaar number and phone number are required'
      });
    }

    // Check duplicates by comparing hashes
    const farmers = await Farmer.find();

    for (const farmer of farmers) {
      const phoneMatch = await bcrypt.compare(phone, farmer.phone);
      const aadhaarMatch = await bcrypt.compare(aadhaarNumber, farmer.aadhaarNumber);

      if (phoneMatch || aadhaarMatch) {
        return res.status(400).json({
          message: 'Farmer already registered'
        });
      }
    }

    // Hash values
    const hashedPhone = await bcrypt.hash(phone, SALT_ROUNDS);
    const hashedAadhaar = await bcrypt.hash(aadhaarNumber, SALT_ROUNDS);

    await Farmer.create({
      aadhaarNumber: hashedAadhaar,
      name,
      phone: hashedPhone,
      location,
      village,
      state,
      farmAcres,
      crop
    });

    res.status(201).json({
      message: 'Signup successful'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Signup failed',
      error: error.message
    });
  }
});

// ==============================
// LOGIN (Aadhaar + Phone BOTH REQUIRED)
// ==============================
router.post('/login', async (req, res) => {
  try {
    const { phone, aadhaarNumber } = req.body;

    // ✅ BOTH REQUIRED
    if (!phone || !aadhaarNumber) {
      return res.status(400).json({
        message: 'Both phone number and Aadhaar number are required'
      });
    }

    const farmers = await Farmer.find();

    for (const farmer of farmers) {
      const phoneMatch = await bcrypt.compare(phone, farmer.phone);
      const aadhaarMatch = await bcrypt.compare(aadhaarNumber, farmer.aadhaarNumber);

      // ✅ BOTH MUST MATCH SAME RECORD
      if (phoneMatch && aadhaarMatch) {
        return res.json({
          message: 'Login successful',
          farmerId: farmer._id
        });
      }
    }

    res.status(401).json({
      message: 'Invalid phone number or Aadhaar number'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
});

module.exports = router;
