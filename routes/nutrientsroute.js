const express = require("express");
const SoilReading = require("../models/SoilReading.js");
const router = express.Router();

// Normal variable to store the record ID
let soilRecordId = null;

// ---- 1) UPDATE OR CREATE SOIL RECORD ----
router.post("/soil/update", async (req, res) => {
  try {
    // STEP 1: If no record ID stored → check DB
    if (!soilRecordId) {
      const existing = await SoilReading.findOne().sort({ createdAt: 1 });

      if (existing) {
        soilRecordId = existing._id;  // store it in normal variable
      }
    }

    // STEP 2: If still no record → create new initial record
    if (!soilRecordId) {
      const created = await SoilReading.create(req.body);
      soilRecordId = created._id;   // save ID in variable

      return res.json({
        message: "Initial soil record created",
        data: created,
      });
    }

    // STEP 3: Update the same record always
    const updated = await SoilReading.findByIdAndUpdate(
      soilRecordId,
      req.body,
      { new: true, runValidators: true }
    );

    return res.json({
      message: "Soil record updated successfully",
      data: updated,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error processing soil record",
      error: error.message,
    });
  }
});


// ---- 2) GET THE CURRENT LATEST SOIL RECORD ----
router.get("/soil/get", async (req, res) => {
  try {
    // If record ID is known, return that record
    if (soilRecordId) {
      const record = await SoilReading.findById(soilRecordId);

      if (record) {
        return res.json({
          message: "Soil record fetched successfully",
          data: record,
        });
      }
    }

    // If record ID is unknown → check DB
    const existing = await SoilReading.findOne().sort({ updatedAt: -1 });

    if (!existing) {
      return res.status(404).json({
        message: "No soil data found",
      });
    }

    // Store ID for future auto-updates
    soilRecordId = existing._id;

    return res.json({
      message: "Soil record fetched successfully",
      data: existing,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching soil record",
      error: error.message,
    });
  }
});
module.exports = router;
