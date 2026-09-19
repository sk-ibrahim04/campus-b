import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, ApprovalStatus, CandidatePlan } from '@campussynapse/shared-types';

export interface IApproval extends Document {
  title: string;
  type: 'EVENT_ALLOCATION' | 'EXAM_RESCHEDULE' | 'MAINTENANCE_LOCK' | 'RESOURCE_REALLOCATION';
  description: string;
  proposedPlan: CandidatePlan;
  requiredRole: UserRole;
  status: ApprovalStatus;
  requestedByAgent: string;
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  comments?: string;
  impactMetrics: {
    attendees: number;
    disruptionScore: number;
    utilizationScore: number;
  };
}

const ApprovalSchema = new Schema<IApproval>(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['EVENT_ALLOCATION', 'EXAM_RESCHEDULE', 'MAINTENANCE_LOCK', 'RESOURCE_REALLOCATION'],
      required: true,
    },
    description: { type: String, required: true },
    proposedPlan: { type: Schema.Types.Mixed, required: true },
    requiredRole: {
      type: String,
      enum: ['SUPER_ADMIN', 'CAMPUS_ADMIN', 'FACULTY', 'STUDENT', 'FACILITY_STAFF'],
      default: 'CAMPUS_ADMIN',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    requestedByAgent: { type: String, required: true },
    requestedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: String },
    comments: { type: String },
    impactMetrics: {
      attendees: { type: Number, default: 0 },
      disruptionScore: { type: Number, default: 0 },
      utilizationScore: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const ApprovalModel = mongoose.model<IApproval>('Approval', ApprovalSchema);
