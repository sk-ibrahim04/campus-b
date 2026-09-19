import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@campussynapse/shared-types';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'CAMPUS_ADMIN', 'FACULTY', 'STUDENT', 'FACILITY_STAFF'],
    default: 'FACULTY',
    required: true,
  },
  department: { type: String },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
