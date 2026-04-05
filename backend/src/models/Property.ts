import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  propertyId: string;
  title: string;
  description: string;
  images: string[];
  amenities: string[];
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
        lat: number;
        lng: number;
    }
  };
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema(
  {
    propertyId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
          lat: { type: Number },
          lng: { type: Number }
      }
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProperty>('Property', PropertySchema);
