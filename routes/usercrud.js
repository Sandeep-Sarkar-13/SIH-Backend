const express = require('express');
const router = express.Router();
const Farmer = require('../models/farmer');

/**
 * CREATE Farmer
 */
router.post('/', async (req, res) => {
  try {
    const farmer = await Farmer.create(req.body);
    res.status(201).json(farmer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * READ All Farmers
 */
router.get('/', async (req, res) => {
  try {
    const farmers = await Farmer.find();
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * READ Farmer by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE Farmer
 */
router.put('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(farmer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE Farmer
 */
router.delete('/:id', async (req, res) => {
  try {
    await Farmer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Farmer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
