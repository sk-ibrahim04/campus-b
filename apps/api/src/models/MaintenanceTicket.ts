import mongoose, { Schema, Document } from 'mongoose';
import { MaintenancePriority, MaintenanceStatus } from '@campussynapse/shared-types';

export interface IMaintenanceTicket extends Document {
  ticketNumber: string;
  title: string;
  description: string;
  category: 'EQUIPMENT' | 'ELECTRICAL' | 'HVAC' | 'PLUMBING' | 'STRUCTURAL';
  subcategory?: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  resourceId: string;
  resourceName: string;
  buildingName: string;
  assignedTeam: string;
  reportedBy: string;
  immediateActionTaken?: string;
  isEscalated: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

const MaintenanceTicketSchema = new Schema<IMaintenanceTicket>(
  {
    ticketNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['EQUIPMENT', 'ELECTRICAL', 'HVAC', 'PLUMBING', 'STRUCTURAL'],
      required: true,
      index: true,
    },
    subcategory: { type: String },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    status: {
      type: String,
      enum: ['REPORTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'REPORTED',
      index: true,
    },
    resourceId: { type: String, required: true, index: true },
    resourceName: { type: String, required: true },
    buildingName: { type: String, required: true },
    assignedTeam: { type: String, default: 'Facilities Management' },
    reportedBy: { type: String, required: true },
    immediateActionTaken: { type: String },
    isEscalated: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const MaintenanceTicketModel = mongoose.model<IMaintenanceTicket>(
  'MaintenanceTicket',
  MaintenanceTicketSchema
);
