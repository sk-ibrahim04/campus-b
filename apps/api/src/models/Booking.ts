import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  title: string;
  resourceId: string;
  resourceName: string;
  buildingName: string;
  organizer: string;
  organizerId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  attendees: number;
  type: 'CLASS' | 'LAB' | 'EVENT' | 'EXAM' | 'MEETING';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  isAutonomous: boolean;
  approvalId?: string;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    title: { type: String, required: true },
    resourceId: { type: String, required: true, index: true },
    resourceName: { type: String, required: true },
    buildingName: { type: String, required: true },
    organizer: { type: String, required: true },
    organizerId: { type: String },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    attendees: { type: Number, required: true },
    type: {
      type: String,
      enum: ['CLASS', 'LAB', 'EVENT', 'EXAM', 'MEETING'],
      default: 'EVENT',
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true,
    },
    isAutonomous: { type: Boolean, default: false },
    approvalId: { type: String },
  },
  { timestamps: true }
);

export const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema);
