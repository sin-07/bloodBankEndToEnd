// ========================
// Type Definitions
// ========================

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'donor' | 'hospital';
  phone?: string;
  city?: string;
  address?: string;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonorProfile {
  _id: string;
  userId: User | string;
  bloodGroup: BloodGroup;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  weight?: number;
  lastDonationDate?: string;
  totalDonations: number;
  medicalConditions: string[];
  isEligible: boolean;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface Donation {
  _id: string;
  donorId: string;
  userId: string;
  bloodGroup: BloodGroup;
  component?: BloodComponent;
  donationType?: 'whole_blood' | 'platelets' | 'plasma';
  units: number;
  donationDate: string;
  location: string;
  status: 'pending' | 'completed' | 'cancelled' | 'rejected';
  healthScreening?: {
    hemoglobin?: number;
    bloodPressure?: string;
    temperature?: number;
    pulse?: number;
    weight?: number;
    passed: boolean;
  };
  notes?: string;
  certificateGenerated: boolean;
  createdAt: string;
}

export interface BloodRequest {
  _id: string;
  requesterId: User | string;
  requesterType: 'hospital' | 'individual';
  patientName: string;
  bloodGroup: BloodGroup;
  component?: BloodComponent;
  units: number;
  urgency: 'normal' | 'urgent' | 'critical';
  reason: string;
  hospitalName?: string;
  city: string;
  contactNumber: string;
  prescriptionUrl?: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected' | 'cancelled';
  matchedDonors: MatchedDonor[];
  fulfilledFrom?: string;
  adminNotes?: string;
  fulfilledDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  _id: string;
  donorId: string | DonorProfile;
  userId: string | User;
  bloodGroup: BloodGroup;
  donationType?: 'whole_blood' | 'platelets' | 'plasma';
  donationDate: string;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface MatchedDonor {
  donorId: string | DonorProfile;
  contacted: boolean;
  response: 'pending' | 'accepted' | 'declined';
}

export interface BloodInventory {
  _id: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  units: number;
  collectionDate: string;
  expiryDate: string;
  source: 'donation' | 'transfer' | 'purchase';
  status: 'available' | 'reserved' | 'issued' | 'expired' | 'discarded';
  storageLocation: string;
  addedBy: User | string;
  notes?: string;
  createdAt: string;
}

export interface Hospital {
  _id: string;
  userId: User | string;
  hospitalName: string;
  registrationNumber: string;
  type: 'government' | 'private' | 'charitable';
  city: string;
  state?: string;
  address: string;
  contactPerson: {
    name: string;
    phone: string;
    email?: string;
    designation?: string;
  };
  totalRequests: number;
  isVerified: boolean;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type BloodComponent =
  | 'whole_blood'
  | 'packed_rbc'
  | 'platelets'
  | 'plasma'
  | 'cryoprecipitate';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  };
}

export interface DashboardStats {
  stats: {
    totalDonors: number;
    totalHospitals: number;
    totalRequests: number;
    pendingRequests: number;
    fulfilledRequests: number;
    totalDonations: number;
    activeUsers: number;
  };
  bloodStock: { _id: string; totalUnits: number }[];
  recentRequests: BloodRequest[];
  donationTrends: {
    _id: { year: number; month: number };
    count: number;
    units: number;
  }[];
  requestsByUrgency: { _id: string; count: number }[];
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: 'donor' | 'hospital';
  phone?: string;
  city?: string;
  address?: string;
  // Donor fields
  bloodGroup?: BloodGroup;
  dateOfBirth?: string;
  gender?: string;
  weight?: number;
  // Hospital fields
  hospitalName?: string;
  registrationNumber?: string;
  hospitalType?: string;
  state?: string;
}

export interface StockAlert {
  bloodGroup: BloodGroup;
  currentUnits: number;
  threshold: number;
  severity: 'warning' | 'critical';
}
