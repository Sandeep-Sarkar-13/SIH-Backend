// farmer.js
const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema(
  {
    aadhaarNumber: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true
    },

    location: String,

    village: {
      type: String,
      required: true
    },

    state: {
      type: String,
      required: true
    },

    farmAcres: {
      type: Number,
      required: true,
      min: 0.1
    },

    crop: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Farmer', farmerSchema);
