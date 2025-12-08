// pesticide.js
const mongoose = require('mongoose');

const pesticideSchema = new mongoose.Schema(
  {
    // 🔗 Reference to the Farmer who owns this pesticide record
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true
    },

    // Name of pesticide used
    name: {
      type: String,
      required: true,
      trim: true
    },

    // YES / NO confirmation (e.g. sprayed or not, verified or not)
    confirmation: {
      type: String,
      enum: ['YES', 'NO','REJECT'],
      default: 'NO'
    },

    // Coordinates of the field where it was used
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },

    // Process status
    process: {
      type: String,
      enum: ['PENDING', 'ONGOING', 'COMPLETE'],
      default: 'PENDING'
    },

    // Grid position on farm map (optional)
    gridRow: {
      type: String
    },
    gridColumn: {
      type: String
    },

    // Quantity of pesticide used (e.g. in litres or kg)
    quantity: {
      type: Number,
      min: 0
    },

    // Device ID if collected via IoT / app
    deviceId: {
      type: String,
      trim: true
    },

    // Date & time of operation
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Pesticide', pesticideSchema);
