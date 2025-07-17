import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number cannot be longer than 20 characters'],
    },
    company: {
      type: String,
      maxlength: [100, 'Company name cannot be more than 100 characters'],
    },
    role: {
      type: String,
      enum: [
        'maritime_agent',
        'cargo_owner',
        'customs_broker',
        'admin',
        'port_authority',
        'viewer',
      ],
      default: 'admin',
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    avatar: {
      type: String,
      default: 'default-avatar.png',
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
      language: {
        type: String,
        default: 'en',
        enum: ['en', 'fr'],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for user's berthings
userSchema.virtual('berthings', {
  ref: 'Berthing',
  localField: '_id',
  foreignField: 'createdBy',
  justOne: false,
});

// Virtual for user's cargo
userSchema.virtual('cargo', {
  ref: 'Berthing',
  localField: '_id',
  foreignField: 'cargoDetails.owner',
  justOne: false,
});

// Virtual for user's notifications
userSchema.virtual('notifications', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export default mongoose.model('User', userSchema);
