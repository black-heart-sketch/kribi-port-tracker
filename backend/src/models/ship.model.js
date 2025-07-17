import mongoose from 'mongoose';

const shipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a ship name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    imoNumber: {
      type: String,
      required: [true, 'Please add an IMO number'],
      unique: true,
      trim: true,
      maxlength: [15, 'IMO number cannot be more than 15 characters'],
    },
    mmsiNumber: {
      type: String,
      trim: true,
    },
    flag: {
      type: String,
      required: [true, 'Please add flag state'],
    },
    type: {
      type: String,
      required: [true, 'Please specify the ship type'],
      enum: [
        'container',
        'tanker',
        'bulk_carrier',
        'general_cargo',
        'roro',
        'passenger',
        'other',
      ],
    },
    length: {
      type: Number,
      required: [true, 'Please add ship length in meters'],
    },
    beam: {
      type: Number,
      required: [true, 'Please add ship beam in meters'],
    },
    draft: {
      type: Number,
      required: [true, 'Please add ship draft in meters'],
    },
    grossTonnage: {
      type: Number,
      required: [true, 'Please add gross tonnage'],
    },
    netTonnage: {
      type: Number,
      required: [true, 'Please add net tonnage'],
    },
    yearBuilt: {
      type: Number,
      required: [true, 'Please add year built'],
    },
    owner: {
      type: String,
      required: [true, 'Please add owner information'],
    },
    status: {
      type: String,
      required: [true, 'Please add status'],
      enum: ['docked', 'arriving', 'delayed'],
      default: 'active',
    },
    company: {
      type: String,
      required: [true, 'Please add a shipping company'],
    },
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    createdBy: {
      type: String,
      required: [true, 'Please specify who created this record'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Reverse populate with virtuals
shipSchema.virtual('berthings', {
  ref: 'Berthing',
  localField: '_id',
  foreignField: 'ship',
  justOne: false,
});

export default mongoose.model('Ship', shipSchema);
