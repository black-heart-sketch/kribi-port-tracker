import mongoose from 'mongoose';

const berthingSchema = new mongoose.Schema(
  {
    ship: {
      type: mongoose.Schema.ObjectId,
      ref: 'Ship',
      required: [true, 'Please select a ship'],
    },
    dock: {
      type: mongoose.Schema.ObjectId,
      ref: 'Dock',
      required: [true, 'Please select a dock'],
    },
    arrivalDate: {
      type: Date,
      required: [true, 'Please add an arrival date'],
    },
    departureDate: {
      type: Date,
      required: [true, 'Please add a departure date'],
      validate: {
        validator: function (value) {
          return value > this.arrivalDate;
        },
        message: 'Departure date must be after arrival date',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    cargoDetails: [
      {
        description: {
          type: String,
          required: [true, 'Please add a cargo description'],
        },
        weight: {
          type: Number,
          required: [true, 'Please add cargo weight in tons'],
        },
        type: {
          type: String,
          required: [true, 'Please specify cargo type'],
          enum: [
            'container',
            'bulk',
            'liquid',
            'break_bulk',
            'neobulk',
            'project_cargo',
            'hazardous',
            'reefer',
            'other',
          ],
        },
        quantity: {
          type: Number,
          default: 1,
        },
        unit: {
          type: String,
          enum: ['TEU', 'FEU', 'tons', 'cbm', 'units', 'barrels'],
          required: [
            function () {
              return this.quantity > 1;
            },
            'Please specify the unit',
          ],
        },
        cargoOwnerId: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: [false, 'Please specify cargo owner'],
        },
        customsStatus: {
          type: String,
          enum: ['not_verified', 'in_progress', 'cleared', 'held','verified'],
          default: 'not_verified',
        },
        processedBy: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        notes: String,
      },
    ],
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    rejectedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    rejectionReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure only one active berthing per dock at a time
berthingSchema.index(
  { dock: 1, status: 1 },
  {
    partialFilterExpression: { status: { $in: ['pending', 'approved'] } },
    message: 'Dock is already occupied or has a pending berthing',
  }
);

// Add text index for search
berthingSchema.index(
  { 'cargoDetails.description': 'text', 'ship.name': 'text' },
  { name: 'berthing_search_index' }
);

// Document middleware to update dock status
berthingSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('status')) {
    const Dock = mongoose.model('Dock');
    const newStatus = this.status === 'approved' ? 'occupied' : 'available';
    
    await Dock.findByIdAndUpdate(this.dock, { status: newStatus });
    
    // If this is an update and status changed from approved to completed
    if (this.isModified('status') && this.status === 'completed') {
      await Dock.findByIdAndUpdate(this.dock, { status: 'available' });
    }
  }
  next();
});

export default mongoose.model('Berthing', berthingSchema);
