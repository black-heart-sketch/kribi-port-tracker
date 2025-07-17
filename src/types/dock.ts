export interface Dock {
  _id: string;
  name: string;
  location?: string;
  status: 'available' | 'occupied' | 'maintenance';
  maxVessels?: number;
  maxDraft: number;
  length: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
