import mongoose from 'mongoose';

const dockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a dock name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location description'],
    },
    length: {
      type: Number,
      required: [true, 'Please add dock length in meters'],
    },
    maxDraft: {
      type: Number,
      required: [true, 'Please add maximum draft in meters'],
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance'],
      default: 'available',
    },
    coordinates: {
      // For map display
      lat: Number,
      lng: Number,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Reverse populate with virtuals
dockSchema.virtual('berthings', {
  ref: 'Berthing',
  localField: '_id',
  foreignField: 'dock',
  justOne: false,
});

export default mongoose.model('Dock', dockSchema);
