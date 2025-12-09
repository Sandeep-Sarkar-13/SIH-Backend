const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: [true, 'Farmer reference is required']
    },

    policyNumber: {
      type: String,
      unique: true,
      required: [true, 'Policy number is required'],
      trim: true
    },

    crop: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true
    },

    sowingDate: {
      type: Date,
      required: [true, 'Sowing date is required'],
      validate: {
        validator(value) {
          // Sowing date cannot be in the future
          return value <= new Date();
        },
        message: 'Sowing date cannot be in the future'
      }
    },

    fieldArea: {
      type: Number, // in acres OR hectares OR bigha OR sqm
      required: [true, 'Field area is required'],
      min: [0.1, 'Field area must be at least 0.1']
    },

    areaUnit: {
      type: String,
      enum: {
        values: ['acre', 'hectare', 'bigha', 'sqm'],
        message: 'Area unit must be acre, hectare, bigha, or sqm'
      },
      default: 'acre'
    },

    premiumAmount: {
      type: Number,
      required: [true, 'Premium amount is required'],
      min: [0, 'Premium amount cannot be negative']
    },

    insuredAmount: {
      type: Number, // Maximum cover amount farmer can claim
      required: [true, 'Insured amount is required'],
      min: [0, 'Insured amount cannot be negative']
    },

    estimatedYield: {
      type: Number, // expected yield per acre/hectare
      required: [true, 'Estimated yield is required'],
      min: [0, 'Estimated yield cannot be negative']
    },

    claimRequested: {
      type: String,
      enum: {
        values: ['YES', 'NO'],
        message: 'claimRequested must be YES or NO'
      },
      default: 'NO'
    },

    ApproveStatus: {
      type: String,
      enum: {
        values: ['Not Requested', 'Pending', 'Approved', 'Rejected', 'Under Review'],
        message: 'Invalid approve status'
      },
      default: 'Not Requested'
    },

    claimAmountRequested: {
      type: Number,
      default: 0,
      min: [0, 'Requested claim amount cannot be negative'],
      validate: {
        validator(value) {
          // allow 0 when no claim requested
          if (!value) return true;
          return value <= this.insuredAmount;
        },
        message: 'Requested claim amount cannot exceed insured amount'
      }
    },

    claimAmountApproved: {
      type: Number,
      default: 0,
      min: [0, 'Approved claim amount cannot be negative'],
      validate: {
        validator(value) {
          // allow 0 when not approved
          if (!value) return true;
          return value <= this.insuredAmount;
        },
        message: 'Approved claim amount cannot exceed insured amount'
      }
    },

    disasterType: {
      type: String,
      enum: {
        values: [
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
        message: 'Invalid disaster type'
      },
      // disaster is needed only when there is a claim
      required: function () {
        return this.claimRequested === 'YES';
      },
      default: 'Other'
    },

    cropStageAtLoss: {
      type: String,
      enum: {
        values: ['Sowing', 'Vegetative', 'Flowering', 'Grain Filling', 'Harvesting', 'Post Harvest'],
        message: 'Invalid crop stage at loss'
      },
      validate: {
        validator(value) {
          // when claim requested, stage must be filled
          if (this.claimRequested === 'YES') {
            return !!value;
          }
          return true;
        },
        message: 'Crop stage at loss is required when claim is requested'
      }
    },

    inspectionReport: {
      type: String, // store document URL / report summary
      trim: true
    },

    geoBoundary: [
      {
        lat: {
          type: Number,
          min: [-90, 'Latitude must be >= -90'],
          max: [90, 'Latitude must be <= 90']
        },
        lng: {
          type: Number,
          min: [-180, 'Longitude must be >= -180'],
          max: [180, 'Longitude must be <= 180']
        }
      }
    ],
                       damagePercent:{
                    type: Number,   
                          required: [true],


                       },
                      farmerExpenditure:{
                        type: Number,
                              required: [true],


                      },
                      marketPricePerTon:{
                        type:Number,
                              required: [true],

                      }
                      ,



    documents: [
      {
        name: {
          type: String,
          trim: true
        },
        url: {
          type: String,
          trim: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Optional: ensure requested amount exists if claimRequested = YES
insuranceSchema.pre('validate', function (next) {
  if (this.claimRequested === 'YES' && !this.claimAmountRequested) {
    this.invalidate('claimAmountRequested', 'Claim amount requested is required when claim is YES');
  }
  next();
});

module.exports = mongoose.model('Insurance', insuranceSchema);
