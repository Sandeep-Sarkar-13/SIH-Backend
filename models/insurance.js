const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true
    },

    policyNumber: {
      type: String,
      unique: true,
     
    },

    crop: {
      type: String,
   
    },

    sowingDate: {
      type: Date,
  
    },

    fieldArea: {
      type: Number, // in acres OR hectares (you can store unit separately)
    
      min: 0.1
    },

    areaUnit: {
      type: String,
      enum: ['acre', 'hectare', 'bigha', 'sqm'],
      default: 'acre'
    },

    premiumAmount: {
      type: Number,
    
    },

    insuredAmount: {
      type: Number, // Maximum cover amount farmer can claim
    
    },

    estimatedYield: {
      type: Number, // expected yield per acre/hectare
    
    },
    claimRequested: {
      type: String,
        enum: ['YES', 'NO'],
      default: 'NO'
    },

    ApproveStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Under Review'],
      default: 'Under Review'
    },

    claimAmountRequested: {
      type: Number,
      default: 0
    },

    claimAmountApproved: {
      type: Number,
      default: 0
    },

    disasterType: {
      type: String,
      enum: [
        'Flood',
        'Drought',
        'Pest Attack',
        'Cyclone',
        'Fire',
        'Rainfall Loss',
        'Heat Stress',
        'Frost',
        'Disease',
        'Other'
      ],
      default: 'Other'
    },

    cropStageAtLoss: {
      type: String,
      enum: ['Sowing', 'Vegetative', 'Flowering', 'Grain Filling', 'Harvesting', 'Post Harvest']
    },

    inspectionReport: {
      type: String // store document URL / report summary
    },

    geoBoundary: [
      {
        lat: Number,
        lng: Number
      }
    ],

    documents: [
      {
        name: String,
        url: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Insurance', insuranceSchema);
