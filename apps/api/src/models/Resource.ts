import mongoose, { Schema, Document } from 'mongoose';
import { ResourceType, ResourceStatus, ResourceScheduleItem, ResourceTelemetry } from '@campussynapse/shared-types';

export interface IResource extends Document {
  name: string;
  code: string;
  type: ResourceType;
  capacity: number;
  status: ResourceStatus;
  buildingId: string;
  buildingName: string;
  floor: number;
  location: string;
  equipment: string[];
  accessibility: boolean;
  maintenanceState?: {
    isUnderMaintenance: boolean;
    issue?: string;
    priority?: string;
    ticketId?: string;
  };
  currentOccupancy: number;
  utilizationRate: number;
  nextAvailable: string;
  schedule: ResourceScheduleItem[];
  telemetry: ResourceTelemetry;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleItemSchema = new Schema({
  bookingId: { type: String, required: true },
  title: { type: String, required: true },
  organizer: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  attendees: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED',
  },
  type: {
    type: String,
    enum: ['CLASS', 'LAB', 'EVENT', 'EXAM', 'MEETING'],
    default: 'CLASS',
  },
});

const TelemetrySchema = new Schema({
  occupancyCount: { type: Number, default: 0 },
  temperatureCelsius: { type: Number, default: 23 },
  powerDrawWatts: { type: Number, default: 450 },
  airQualityIndex: { type: Number, default: 42 },
  lastPingTime: { type: String, default: () => new Date().toISOString() },
});

const ResourceSchema = new Schema<IResource>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ['CLASSROOM', 'LABORATORY', 'SEMINAR_HALL', 'AUDITORIUM', 'MEETING_ROOM'],
      required: true,
      index: true,
    },
    capacity: { type: Number, required: true, index: true },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'BLOCKED', 'UNDER_REVIEW'],
      default: 'AVAILABLE',
      index: true,
    },
    buildingId: { type: String, required: true, index: true },
    buildingName: { type: String, required: true },
    floor: { type: Number, default: 1 },
    location: { type: String, required: true },
    equipment: [{ type: String }],
    accessibility: { type: Boolean, default: true },
    maintenanceState: {
      isUnderMaintenance: { type: Boolean, default: false },
      issue: { type: String },
      priority: { type: String },
      ticketId: { type: String },
    },
    currentOccupancy: { type: Number, default: 0 },
    utilizationRate: { type: Number, default: 0 },
    nextAvailable: { type: String, default: 'Now' },
    schedule: [ScheduleItemSchema],
    telemetry: { type: TelemetrySchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const ResourceModel = mongoose.model<IResource>('Resource', ResourceSchema);
