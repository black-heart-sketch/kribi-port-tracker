import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Notification must belong to a user'],
    },
    title: {
      type: String,
      required: [true, 'Please add a notification title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Please add a notification message'],
    },
    type: {
      type: String,
      enum: [
        'berthing_request',
        'berthing_approved',
        'berthing_rejected',
        'cargo_update',
        'customs_update',
        'system',
      ],
      default: 'system',
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedDocument: {
      type: mongoose.Schema.ObjectId,
      refPath: 'relatedDocumentModel',
    },
    relatedDocumentModel: {
      type: String,
      enum: ['Berthing', 'Cargo'],
    },
    fromUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    actionUrl: String, 
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster querying
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// Static method to create a notification
notificationSchema.statics.createNotification = async function (data) {
  return this.create({
    user: data.userId,
    title: data.title,
    message: data.message,
    type: data.type || 'system',
    relatedDocument: data.relatedDocument,
    relatedDocumentModel: data.relatedDocumentModel,
    actionUrl: data.actionUrl,
  });
};

export default mongoose.model('Notification', notificationSchema);
