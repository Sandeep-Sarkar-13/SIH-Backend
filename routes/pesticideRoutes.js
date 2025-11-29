const express = require('express');
const router = express.Router();
const Pesticide = require('../models/pesticide');

/**
 * CREATE Pesticide (belongs to Farmer)
 */
router.post('/', async (req, res) => {
  try {
    const pesticide = await Pesticide.create(req.body);
    res.status(201).json(pesticide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * READ All Pesticides
 */
router.get('/', async (req, res) => {
  try {
    const pesticides = await Pesticide.find().populate('farmer');
    res.json(pesticides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * READ Pesticides by Farmer ID
 */
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const pesticides = await Pesticide.find({ farmer: req.params.farmerId });
    res.json(pesticides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * READ Pesticide by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const pesticide = await Pesticide.findById(req.params.id);
    if (!pesticide) return res.status(404).json({ message: 'Not found' });
    res.json(pesticide);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE Pesticide
 */
router.put('/:id', async (req, res) => {
  try {
    const pesticide = await Pesticide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(pesticide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE Pesticide
 */
router.delete('/:id', async (req, res) => {
  try {
    await Pesticide.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pesticide deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET Most Recent PENDING pesticide with confirmation YES
 */
router.get('/latest/pending', async (req, res) => {
  try {
    const pesticide = await Pesticide.findOne({
      confirmation: 'YES',
      process: 'PENDING'
    })
      .sort({ createdAt: -1 })
      .populate('farmer');

    if (!pesticide) {
      return res.status(404).json({
        message: 'No pending confirmed pesticide found'
      });
    }

    res.json(pesticide);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.patch('/:id/process', async (req, res) => {
  try {
    const { process } = req.body;

    if (!['PENDING', 'ONGOING', 'COMPLETE'].includes(process)) {
      return res.status(400).json({
        message: 'Invalid process status'
      });
    }

    const pesticide = await Pesticide.findByIdAndUpdate(
      req.params.id,
      { process },
      { new: true }
    );

    if (!pesticide) {
      return res.status(404).json({ message: 'Pesticide not found' });
    }

    res.json({
      message: 'Process status updated successfully',
      pesticide
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
