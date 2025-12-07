const mongoose = require("mongoose");

const SoilReadingSchema = new mongoose.Schema(
  {
    nitrogen: {
      type: Number,
      required: [true, "Nitrogen value is required"],
      min: [0, "Nitrogen cannot be negative"],
      max: [500, "Nitrogen value seems unrealistic"],
    },

    phosphorus: {
      type: Number,
      required: [true, "Phosphorus value is required"],
      min: [0, "Phosphorus cannot be negative"],
      max: [500, "Phosphorus value seems unrealistic"],
    },

    potassium: {
      type: Number,
      required: [true, "Potassium value is required"],
      min: [0, "Potassium cannot be negative"],
      max: [500, "Potassium value seems unrealistic"],
    },

    ph: {
      type: Number,
      required: [true, "pH value is required"],
      min: [0, "pH must be at least 0"],
      max: [14, "pH cannot be above 14"],
    },

    conductivity: {
      type: Number,
      required: [true, "Conductivity is required"],
      min: [0, "Conductivity cannot be negative"],
      max: [5000, "Conductivity value too high"],
    },

    temperature: {
      type: Number,
      required: [true, "Temperature is required"],
      min: [-20, "Temperature too low"],
      max: [80, "Temperature too high"],
    },

    humidity: {
      type: Number,
      required: [true, "Humidity is required"],
      min: [0, "Humidity cannot be less than 0%"],
      max: [100, "Humidity cannot exceed 100%"],
    },

    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const SoilReading = mongoose.model("SoilReading", SoilReadingSchema);

module.exports = SoilReading;
