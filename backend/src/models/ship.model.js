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
    company: {
      type: String,
      required: [true, 'Please add a shipping company'],
    },
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    length: {
      type: Number,
      required: [true, 'Please add ship length in meters'],
    },
    grossTonnage: {
      type: Number,
      required: [true, 'Please add gross tonnage'],
    },
    flag: {
      type: String,
      required: [true, 'Please add flag state'],
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
