import mongoose, { Schema, Document } from 'mongoose';

export interface IPolicyRule extends Document {
  code: string;
  name: string;
  description: string;
  category: 'SAFETY' | 'CAPACITY' | 'SCHEDULE' | 'MAINTENANCE' | 'GOVERNANCE';
  isHardConstraint: boolean;
  isActive: boolean;
}

const PolicyRuleSchema = new Schema<IPolicyRule>({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['SAFETY', 'CAPACITY', 'SCHEDULE', 'MAINTENANCE', 'GOVERNANCE'],
    default: 'SAFETY',
  },
  isHardConstraint: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
});

export const PolicyRuleModel = mongoose.model<IPolicyRule>('PolicyRule', PolicyRuleSchema);

export interface IAutonomyConfig extends Document {
  level: number; // 0, 1, 2, 3
  allowAutoRecovery: boolean;
  allowAutoTicketTriage: boolean;
  allowAutoConflictNotification: boolean;
  scoringWeights: {
    feasibilityWeight: number;
    disruptionWeight: number;
    utilizationWeight: number;
    distanceWeight: number;
    preferenceWeight: number;
  };
  updatedAt: Date;
}

const AutonomyConfigSchema = new Schema<IAutonomyConfig>({
  level: { type: Number, default: 2 },
  allowAutoRecovery: { type: Boolean, default: true },
  allowAutoTicketTriage: { type: Boolean, default: true },
  allowAutoConflictNotification: { type: Boolean, default: true },
  scoringWeights: {
    feasibilityWeight: { type: Number, default: 0.35 },
    disruptionWeight: { type: Number, default: 0.25 },
    utilizationWeight: { type: Number, default: 0.20 },
    distanceWeight: { type: Number, default: 0.10 },
    preferenceWeight: { type: Number, default: 0.10 },
  },
  updatedAt: { type: Date, default: Date.now },
});

export const AutonomyConfigModel = mongoose.model<IAutonomyConfig>(
  'AutonomyConfig',
  AutonomyConfigSchema
);
