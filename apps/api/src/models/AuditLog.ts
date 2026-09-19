import mongoose, { Schema, Document } from 'mongoose';
import { ApprovalStatus } from '@campussynapse/shared-types';

export interface IAuditLog extends Document {
  timestamp: Date;
  actor: string;
  agent?: string;
  action: string;
  reason: string;
  affectedResources: string[];
  previousState?: string;
  newState?: string;
  approvalRequired: boolean;
  approvalStatus?: ApprovalStatus;
  metadata?: Record<string, unknown>;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    actor: { type: String, required: true },
    agent: { type: String },
    action: { type: String, required: true },
    reason: { type: String, required: true },
    affectedResources: [{ type: String }],
    previousState: { type: String },
    newState: { type: String },
    approvalRequired: { type: Boolean, default: false },
    approvalStatus: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
