export interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location: string;
  mode: ('online' | 'offline' | 'both')[];
  qualification: string;
  bio: string;
  verified: boolean;
  languages: string[];
  teachingLevels: string[];
  responseTime: string;
  studentsTaught: number;
  locality?: string;
  pincode?: string;
  travelRadiusKm?: number;
  boards?: string[];
  offersFreeDemo?: boolean;
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  location: string;
  joinedDate: string;
  requirements: TuitionRequirement[];
  coins: number;
  subscription: Subscription | null;
}

export interface TuitionRequirement {
  id: string;
  subject: string;
  level: string;
  board?: string;
  location: string;
  locality?: string;
  pincode?: string;
  mode: 'online' | 'offline' | 'both';
  budget: string;
  description: string;
  status: 'active' | 'closed';
  createdAt: string;
  responses: number;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  coinsPerMonth: number;
  features: string[];
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  balance: number;
}

export interface TutorApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  qualification: string;
  experience: number;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
}
