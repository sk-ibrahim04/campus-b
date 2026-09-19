import mongoose, { Schema, Document } from 'mongoose';

export interface IBuilding extends Document {
  name: string;
  code: string;
  totalFloors: number;
  departments: string[];
  totalRooms: number;
  description?: string;
  createdAt: Date;
}

const BuildingSchema = new Schema<IBuilding>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, index: true },
  totalFloors: { type: Number, default: 4 },
  departments: [{ type: String }],
  totalRooms: { type: Number, default: 0 },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const BuildingModel = mongoose.model<IBuilding>('Building', BuildingSchema);
