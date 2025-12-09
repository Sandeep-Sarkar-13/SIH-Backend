// routes/insuranceRoutes.js
const express = require('express');
const Insurance = require('../models/insurance');

const router = express.Router();

/**
 * Helper: convert any unit to hectare (approx values)
 */
function toHectare(area, unit) {
  if (!area) return 0;
  switch (unit) {
    case 'hectare':
      return area;
    case 'acre':
      return area * 0.404686; // 1 acre = 0.404686 ha
    case 'bigha':
      // NOTE: beegah varies by state; this is a rough average
      return area * 0.25;
    case 'sqm':
      return area / 10000.0;
    default:
      return area;
  }
}

/**
 * CREATE Insurance (all fields can be sent in body)
 * POST /api/insurance
 */
router.post('/', async (req, res) => {
  try {
    const insurance = new Insurance(req.body);
    const saved = await insurance.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create insurance error:', err);
    res.status(400).json({ message: 'Error creating insurance policy', error: err.message });
  }
});

/**
 * GET all policies
 * GET /api/insurance
 */
router.get('/', async (req, res) => {
  try {
    const policies = await Insurance.find().populate('farmer');
    res.json(policies);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching insurance policies', error: err.message });
  }
});

/**
 * GET single policy
 * GET /api/insurance/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const policy = await Insurance.findById(req.params.id).populate('farmer');
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching policy', error: err.message });
  }
});

/**
 * FULL UPDATE (modify any field)
 * PUT /api/insurance/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const updated = await Insurance.findByIdAndUpdate(
      req.params.id,
      req.body,          // you can control allowed fields here if you want
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Policy not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Error updating policy', error: err.message });
  }
});

/**
 * PARTIAL UPDATE (modify only some fields)
 * PATCH /api/insurance/:id
 */
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Insurance.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Policy not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Error updating policy', error: err.message });
  }
});

/**
 * DELETE policy (optional)
 * DELETE /api/insurance/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Insurance.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Policy not found' });
    res.json({ message: 'Policy deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting policy', error: err.message });
  }
});

/**
 * 3️⃣ SPECIAL API:
 *  - Accepts sowing date (or uses policy.sowingDate)
 *  - Calculates days past
 *  - Uses government rules (image you sent) to estimate compensation
 *
 * POST /api/insurance/:id/calculate-compensation
 *
 * Body example:
 * {
 *   "sowingDate": "2025-06-01",     // optional override
 *   "damagePercent": 40,
 *   "isPostHarvestLoss": false,
 *   "farmerExpenditure": 25000,     // Rs spent till now
 *   "marketPricePerTon": 18000      // Rs / ton (for post-harvest)
 * }
 */
router.post('/:id/calculate-compensation', async (req, res) => {
  try {
    const policy = await Insurance.findById(req.params.id);
    if (!policy) return res.status(404).json({ message: 'Policy not found' });

    // 1. Get sowing date
    const sowingDate =
      req.body.sowingDate ? new Date(req.body.sowingDate) : policy.sowingDate;

    if (!sowingDate) {
      return res.status(400).json({ message: 'Sowing date is required (in body or policy)' });
    }

    // 2. Days since sowing
    const today = new Date();
    const diffMs = today.getTime() - sowingDate.getTime();
    const daysPast = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // 3. Decide stage using govt image:
    //    - Crop duration: 120 days sowing → harvest
    //    - First 30 days: seedbed (before transplanting)
    //    - After 30 days: transplanted crop, insurance active
    //    - 50–90 days after transplant is main risk window (~day 80–120 from sowing)
    let stage;
    if (daysPast <= 30) {
      stage = 'Seedbed';
    } else if (daysPast <= 120) {
      stage = 'ActiveInsuranceWindow'; // crop standing
    } else {
      stage = 'PostHarvest';
    }

    // 4. Compensation rules from the table
    const {
      damagePercent = 0,
      isPostHarvestLoss = false,
      farmerExpenditure = 0,
      marketPricePerTon = 0
    } = req.body;

    const insuredAmount = policy.insuredAmount || 0;
    let compensation = 0;
    let basis = '';
    let ruleUsed = '';

    if (stage === 'Seedbed') {
      // From image: only seed cost (6kg per beegah costing 300–400 Rs) is reimbursed.
      const beegahArea =
        policy.areaUnit === 'bigha' ? policy.fieldArea || 0 : 0;

      const avgSeedCostPerBeegah = 350; // mid of 300–400, you can externalise this
      compensation = beegahArea * avgSeedCostPerBeegah;

      basis =
        'Seedbed stage loss – only seed cost reimbursed as per scheme (6 kg seed per beegah, ~₹300–₹400).';
      ruleUsed = 'Seed requirement and cost';
    } else if (stage === 'ActiveInsuranceWindow') {
      // From image:
      //  - Minimum 33% damage required
      //  - Up to 90% of farmer expenditure in insured window
      if (damagePercent < 33) {
        compensation = 0;
        basis =
          'Damage is below 33% minimum requirement – no payout as per government insurance model.';
        ruleUsed = 'Minimum loss requirement';
      } else {
        const maxEligible = farmerExpenditure * 0.9;  // 90% of expenditure
        compensation = Math.min(maxEligible, insuredAmount || maxEligible);
        basis =
          'Pre-harvest loss within active insurance window – up to 90% of farmer expenditure, capped by sum insured.';
        ruleUsed = 'Farmer expenditure covered + Minimum loss requirement';
      }
    } else if (stage === 'PostHarvest' && isPostHarvestLoss) {
      // From image:
      //  - Govt assumes 5–6 t/ha for valuation
      //  - 100% of assessed value if harvested crop destroyed in field
      const areaHa = toHectare(policy.fieldArea || 0, policy.areaUnit);
      const assumedYieldPerHa = 5.5; // tons/ha (mid of 5–6)
      const totalYieldTons = areaHa * assumedYieldPerHa;

      const assessedValue = totalYieldTons * marketPricePerTon;
      compensation = assessedValue; // 100% of assessed value

      basis =
        'Post-harvest loss – 100% of assessed value based on assumed yield 5–6 t/ha and market price.';
      ruleUsed = 'Yield assumption for valuation + Post-harvest loss rule';
    } else {
      // Post-harvest but not flagged as post-harvest loss
      basis =
        'No compensation rule applicable for the given stage and inputs. Check if this is a valid claim scenario.';
      ruleUsed = 'None';
    }

    return res.json({
      policyId: policy._id,
      sowingDate,
      today,
      daysPast,
      stage,
      damagePercent,
      compensation,
      currency: 'INR',
      basis,
      ruleUsed
    });
  } catch (err) {
    console.error('Compensation calc error:', err);
    res.status(500).json({ message: 'Error calculating compensation', error: err.message });
  }
});

module.exports = router;
