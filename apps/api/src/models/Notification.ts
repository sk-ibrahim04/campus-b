import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@campussynapse/shared-types';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  recipientRole?: UserRole;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['INFO', 'SUCCESS', 'WARNING', 'CRITICAL'],
      default: 'INFO',
    },
    recipientRole: { type: String },
    isRead: { type: Boolean, default: false },
    actionUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
