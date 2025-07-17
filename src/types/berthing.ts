import { Ship } from './ship';

export type BerthingStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';

export interface BerthingRequest {
  _id: string;
  ship: Ship | string; // Can be a populated ship object or just the ID
  dock: string; // Dock ID or populated dock object
  requestedBy: string; // User ID who made the request
  status: BerthingStatus;
  arrivalTime: Date | string;
  departureTime?: Date | string;
  purpose: string;
  cargoDescription?: string;
  agentName?: string;
  agentContact?: string;
  specialRequirements?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  approvedBy?: string; // User ID who approved/rejected
  approvedAt?: Date | string;
  rejectionReason?: string;
  __v?: number;
}

export interface BerthingRequestFormData {
  ship: string; // Ship ID
  dock: string; // Dock ID
  arrivalTime: string;
  departureTime?: string;
  purpose: string;
  cargoDescription?: string;
  agentName?: string;
  agentContact?: string;
  specialRequirements?: string;
}

export interface UpdateBerthingStatusData {
  status: BerthingStatus;
  rejectionReason?: string;
}
