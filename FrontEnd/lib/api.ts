/**
 * HomeTutor API Client
 *
 * Talks to the real ASP.NET Core backend. Replaces all imports from '@/lib/mock-data'.
 *
 * Setup:
 *   1. npm install   (axios is already in package.json)
 *   2. .env.local → NEXT_PUBLIC_API_URL=http://localhost:5000/api  (already created)
 */

import axios, { AxiosError } from 'axios';
import type { Tutor, Student, Transaction, TutorApplication } from './types';

// In the browser, use same-origin relative '/api' so requests route through Next.js rewrites,
// unless NEXT_PUBLIC_API_URL is explicitly set for direct cross-origin backend communication.
// On the server side (SSR / Node), resolve NEXT_PUBLIC_API_URL, then BACKEND_URL, then localhost.
const BASE = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '/api')
  : (process.env.NEXT_PUBLIC_API_URL || (process.env.BACKEND_URL ? `${process.env.BACKEND_URL.replace(/\/+$/, '')}/api` : 'http://localhost:5000/api'));

export const api = axios.create({ baseURL: BASE });

// ── Attach JWT automatically ──────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auto-refresh on 401 ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as any;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        if (typeof window !== 'undefined') {
          const rt = localStorage.getItem('refreshToken');
          if (rt) {
            const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken: rt });
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            original.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(original);
          }
        }
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
    }
    return Promise.reject(err);
  }
);

// ════════════════════════════════════════════════════════════════════════════
// ADAPTERS — reconcile backend DTO shape with frontend types.
// ASP.NET Core serializes to camelCase automatically, but a couple of fields
// genuinely differ in shape between the backend DTOs and the frontend's
// hand-written types. Rather than faking data, we translate it faithfully here
// so every page can keep using the same `Tutor` / `Student` shapes they were
// already built against.
// ════════════════════════════════════════════════════════════════════════════

/** Backend TutorListDto/TutorDetailDto as received over the wire (camelCased). */
interface TutorDtoRaw {
  id: string;
  userId?: string;
  name: string;
  avatar?: string | null;
  subjects: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location?: string | null;
  mode: string; // "Online" | "Offline" | "Both"
  qualification?: string | null;
  bio?: string | null;
  isVerified: boolean;
  languages: string[];
  teachingLevels: string[];
  responseTime?: string | null;
  studentsTaught: number;
  locality?: string | null;
  pincode?: string | null;
  travelRadiusKm?: number | null;
  boards?: string[];
  offersFreeDemo?: boolean;
  phone?: string | null;
  email?: string | null;
  reviews?: {
    id: string;
    studentName: string;
    studentAvatar?: string | null;
    rating: number;
    reviewText?: string | null;
    createdAt: string;
  }[];
  availabilities?: {
    id: number;
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface TutorReview {
  id: string;
  studentName: string;
  studentAvatar: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

export interface TutorAvailability {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
}

/** Extra fields only present on the detail (single-tutor) endpoint. */
export interface TutorDetail extends Tutor {
  phone?: string;
  email?: string;
  reviews: TutorReview[];
  availabilities?: TutorAvailability[];
}

function mapMode(backendMode: string): ('online' | 'offline' | 'both')[] {
  switch ((backendMode || '').toLowerCase()) {
    case 'online':
      return ['online'];
    case 'offline':
      return ['offline'];
    case 'both':
      return ['both'];
    default:
      return ['both'];
  }
}

/** Backend WalletSummaryDto as received over the wire. */
interface WalletSummaryDtoRaw {
  balance: number;
  transactions: {
    id: string;
    type: string; // "Credit" | "Debit"
    amount: number;
    description: string;
    createdAt: string;
    balanceAfter: number;
  }[];
}

/** Frontend-friendly wallet shape used by the wallet page. */
export interface WalletSummary {
  coinBalance: number;
  transactions: Transaction[];
}

function mapWallet(dto?: WalletSummaryDtoRaw | null): WalletSummary {
  if (!dto) {
    return { coinBalance: 0, transactions: [] };
  }
  return {
    coinBalance: dto.balance ?? 0,
    transactions: (dto.transactions ?? []).map((t) => ({
      id: t?.id ?? '',
      type: (t?.type || '').toLowerCase() === 'credit' ? 'credit' : 'debit',
      amount: t?.amount ?? 0,
      description: t?.description ?? 'Coin transaction',
      date: t?.createdAt ?? '',
      balance: t?.balanceAfter ?? 0,
    })),
  };
}

/** Converts a raw backend tutor DTO into the frontend's Tutor shape. */
function mapTutor(dto: TutorDtoRaw): Tutor {
  return {
    id: dto.id,
    name: dto.name,
    avatar: dto.avatar ?? '',
    subjects: dto.subjects ?? [],
    experience: dto.experience,
    rating: dto.rating,
    reviewCount: dto.reviewCount,
    hourlyRate: dto.hourlyRate,
    location: dto.location ?? '',
    mode: mapMode(dto.mode),
    qualification: dto.qualification ?? '',
    bio: dto.bio ?? '',
    verified: dto.isVerified,
    languages: dto.languages ?? [],
    teachingLevels: dto.teachingLevels ?? [],
    responseTime: dto.responseTime ?? '',
    studentsTaught: dto.studentsTaught,
    locality: dto.locality ?? undefined,
    pincode: dto.pincode ?? undefined,
    travelRadiusKm: dto.travelRadiusKm ?? undefined,
    boards: dto.boards ?? [],
    offersFreeDemo: dto.offersFreeDemo ?? true,
  };
}

/** Same as mapTutor but also carries the detail-only fields (reviews, contact info). */
function mapTutorDetail(dto: TutorDtoRaw): TutorDetail {
  return {
    ...mapTutor(dto),
    phone: dto.phone ?? undefined,
    email: dto.email ?? undefined,
    reviews: (dto.reviews ?? []).map((r) => ({
      id: r.id,
      studentName: r.studentName,
      studentAvatar: r.studentAvatar ?? '',
      rating: r.rating,
      reviewText: r.reviewText ?? '',
      createdAt: r.createdAt,
    })),
    availabilities: (dto.availabilities ?? []).map((a) => ({
      id: a.id,
      day: a.day,
      startTime: typeof a.startTime === 'string' ? a.startTime : String(a.startTime),
      endTime: typeof a.endTime === 'string' ? a.endTime : String(a.endTime),
    })),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════════════════
export const authApi = {
  registerStudent: (body: {
    fullName: string; email: string; phone: string;
    password: string; confirmPassword: string; city?: string;
  }) => api.post('/auth/register/student', body).then(r => r.data),

  registerTutor: (body: {
    fullName: string; email: string; phone: string;
    password: string; confirmPassword: string; city?: string;
    qualification?: string; experienceYears: number;
    subjectIds: number[]; teachingLevels: string[];
    bio?: string; teachingMode: string; hourlyRate: number;
  }) => api.post('/auth/register/tutor', body).then(r => r.data),

  login: (body: { email: string; password: string }) =>
    api.post('/auth/login', body).then(r => {
      const d = r.data;
      localStorage.setItem('accessToken', d.accessToken);
      localStorage.setItem('refreshToken', d.refreshToken);
      localStorage.setItem('user', JSON.stringify(d.user));
      return d;
    }),

  logout: () =>
    api.post('/auth/logout').finally(() => localStorage.clear()),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then(r => r.data),

  resetPassword: (body: { token: string; email: string; newPassword: string }) =>
    api.post('/auth/reset-password', body).then(r => r.data),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', body).then(r => r.data),

  getUser: (): any | null => {
    if (typeof window === 'undefined') return null;
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  isLoggedIn: () => typeof window !== 'undefined' && !!localStorage.getItem('accessToken'),
};

// ════════════════════════════════════════════════════════════════════════════
// LOOKUPS (subjects, cities, teaching levels — replaces mock-data arrays)
// ════════════════════════════════════════════════════════════════════════════
export const lookupsApi = {
  getSubjects: () =>
    api.get('/lookups/subjects').then(r => r.data as { id: number; name: string; category?: string }[]),

  getCities: () =>
    api.get('/lookups/cities').then(r => r.data as { id: number; city: string; state?: string }[]),

  getTeachingLevels: () =>
    api.get('/lookups/teaching-levels').then(r => r.data as string[]),

  getCurriculums: () =>
    ['CBSE', 'ICSE', 'Kerala State Syllabus', 'ISC', 'IGCSE', 'IB'],

  getCommonLocalities: () =>
    ['Kakkanad', 'Edappally', 'Kaloor', 'Palarivattom', 'Kadavanthra', 'Aluva', 'Thrippunithura', 'Panampilly Nagar', 'Fort Kochi', 'Vytilla', 'MG Road', 'Kowdiar', 'Pattom', 'Sasthamangalam', 'Kazhakoottam'],
};

// ════════════════════════════════════════════════════════════════════════════
// TUTORS (replaces import { tutors } from '@/lib/mock-data')
// ════════════════════════════════════════════════════════════════════════════
export interface Enquiry {
  id: string;
  tutorProfileId: string;
  tutorName?: string;
  tutorAvatar?: string;
  studentName?: string;
  studentAvatar?: string;
  subject: string;
  level: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
}

export interface VerificationDocument {
  id: string;
  docType: string;
  status: string;
  fileUrl: string;
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface PendingVerificationDocument {
  id: string;
  tutorId: string;
  tutorName: string;
  docType: string;
  fileUrl: string;
  createdAt: string;
}

export const tutorsApi = {
  search: async (params: {
    search?: string; city?: string; subject?: string; level?: string;
    mode?: string[]; minRate?: number; maxRate?: number; minRating?: number;
    verifiedOnly?: boolean; sortBy?: string; page?: number; pageSize?: number;
    locality?: string; pincode?: string; boards?: string[]; freeDemoOnly?: boolean;
  }): Promise<{ items: Tutor[]; totalCount: number; page: number; pageSize: number; totalPages: number }> => {
    const { data } = await api.get('/tutors/search', { params });
    return { ...data, items: (data.items as TutorDtoRaw[]).map(mapTutor) };
  },

  getById: async (id: string): Promise<TutorDetail> => {
    const { data } = await api.get(`/tutors/${id}`);
    return mapTutorDetail(data as TutorDtoRaw);
  },

  getMyProfile: async (): Promise<TutorDetail> => {
    const { data } = await api.get('/tutors/me');
    return mapTutorDetail(data as TutorDtoRaw);
  },

  updateProfile: (body: {
    qualification?: string; experienceYears?: number; bio?: string;
    teachingMode?: string; hourlyRate?: number; subjectIds?: number[];
    teachingLevels?: string[]; languages?: string[]; responseTime?: string;
    locality?: string; pincode?: string; travelRadiusKm?: number;
    boards?: string[]; offersFreeDemo?: boolean;
  }) => api.put('/tutors/me', body).then(r => r.data),

  uploadProfileImage: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/tutors/me/profile-image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data as { url: string });
  },

  uploadVerificationDocument: (file: File, docType: string) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('docType', docType);
    return api.post('/tutors/me/verification-documents', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data as VerificationDocument);
  },

  getVerificationDocuments: (): Promise<VerificationDocument[]> =>
    api.get('/tutors/me/verification-documents').then(r => r.data),

  getStats: () => api.get('/tutors/me/stats').then(r => r.data),
  getWallet: async (): Promise<WalletSummary> => {
    const { data } = await api.get('/tutors/me/wallet');
    return mapWallet(data as WalletSummaryDtoRaw);
  },
  getEnquiries: (): Promise<Enquiry[]> => api.get('/tutors/me/enquiries').then(r => r.data),

  setAvailability: (slots: { dayOfWeek: number; startTime: string; endTime: string }[]) =>
    api.put('/tutors/me/availability', { slots }).then(r => r.data),
};

// ════════════════════════════════════════════════════════════════════════════
// STUDENTS
// ════════════════════════════════════════════════════════════════════════════
export const studentsApi = {
  getProfile: (): Promise<Student> => api.get('/students/me').then(r => r.data),
  getStats: () => api.get('/students/me/stats').then(r => r.data),

  postRequirement: (body: {
    subject: string; level: string; city?: string;
    mode: string; budget?: string; frequencyPerWeek?: number; description?: string;
    board?: string; locality?: string; pincode?: string;
  }) => api.post('/students/me/requirements', body).then(r => r.data),

  getRequirements: () => api.get('/students/me/requirements').then(r => r.data),
  closeRequirement: (id: string) => api.delete(`/students/me/requirements/${id}`).then(r => r.data),

  sendEnquiry: (body: { tutorProfileId: string; subject: string; level: string; message?: string }) =>
    api.post('/students/me/enquiries', body).then(r => r.data),

  getEnquiries: () => api.get('/students/me/enquiries').then(r => r.data),

  submitReview: (body: { tutorProfileId: string; rating: number; reviewText?: string }) =>
    api.post('/students/me/reviews', body).then(r => r.data),

  getWallet: async (): Promise<WalletSummary> => {
    const { data } = await api.get('/students/me/wallet');
    return mapWallet(data as WalletSummaryDtoRaw);
  },
};

// ════════════════════════════════════════════════════════════════════════════
// PAYMENTS & SUBSCRIPTIONS (replaces subscriptions / coinPackages mock arrays)
// ════════════════════════════════════════════════════════════════════════════
export interface SubscriptionPlan {
  id: number;
  name: string;
  tier: string;
  audience: 'Student' | 'Tutor' | 'Both';
  price: number;
  coinsPerMonth: number;
  features: string[];
  isPopular: boolean;
  durationDays: number;
}

export const paymentsApi = {
  getPlans: (audience?: 'Student' | 'Tutor'): Promise<SubscriptionPlan[]> =>
    api.get('/payments/plans', { params: audience ? { audience } : undefined }).then(r => r.data),
  getCoinPackages: () => api.get('/payments/coin-packages').then(r => r.data),

  createOrder: (body: { planId?: number; coinPackageAmount?: number }) =>
    api.post('/payments/create-order', body).then(r => r.data as {
      orderId: string; amount: number; currency: string; key: string;
    }),

  verifyPayment: (body: {
    razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string;
    paymentType: 'subscription' | 'coin_purchase'; planId?: number; coinsAmount?: number;
  }) => api.post('/payments/verify', body).then(r => r.data),
};

// ════════════════════════════════════════════════════════════════════════════
// ADMIN (replaces dashboardStats / revenueData / userGrowthData / applications)
// ════════════════════════════════════════════════════════════════════════════
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard').then(r => r.data),

  getTutors: (params?: { status?: string; page?: number; pageSize?: number }) =>
    api.get('/admin/tutors', { params }).then(r => r.data),

  updateTutorStatus: (id: string, status: 'Approved' | 'Rejected') =>
    api.put(`/admin/tutors/${id}/status`, { status }).then(r => r.data),

  getUsers: (params?: { search?: string; role?: string; page?: number; pageSize?: number }) =>
    api.get('/admin/users', { params }).then(r => r.data),

  toggleUser: (id: string) => api.put(`/admin/users/${id}/toggle`).then(r => r.data),

  getPayments: (params?: { page?: number; pageSize?: number }) =>
    api.get('/admin/payments', { params }).then(r => r.data),

  getRequirements: (params?: { page?: number; pageSize?: number }) =>
    api.get('/admin/requirements', { params }).then(r => r.data),

  getPendingVerificationDocuments: (): Promise<PendingVerificationDocument[]> =>
    api.get('/admin/verification-documents/pending').then(r => r.data),

  getTutorVerificationDocuments: (tutorId: string): Promise<VerificationDocument[]> =>
    api.get(`/admin/tutors/${tutorId}/verification-documents`).then(r => r.data),

  reviewVerificationDocument: (id: string, body: { approve: boolean; rejectionReason?: string }) =>
    api.put(`/admin/verification-documents/${id}/review`, body).then(r => r.data),
};

// ════════════════════════════════════════════════════════════════════════════
// BOOKINGS & SCHEDULING
// ════════════════════════════════════════════════════════════════════════════
export interface Booking {
  id: string;
  studentProfileId: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  tutorProfileId: string;
  tutorName: string;
  tutorAvatar?: string;
  subject: string;
  mode: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Rescheduled';
  startTime: string;
  endTime: string;
  hourlyRate: number;
  isTrial: boolean;
  meetingLink?: string;
  locationAddress?: string;
  studentNotes?: string;
  cancellationReason?: string;
  gradeLevel?: string;
  createdAt: string;
}

export const bookingsApi = {
  create: (body: {
    tutorProfileId: string;
    subject: string;
    mode: string;
    startTime: string;
    endTime: string;
    isTrial?: boolean;
    studentNotes?: string;
    locationAddress?: string;
    gradeLevel?: string;
  }): Promise<Booking> => api.post('/bookings', body).then(r => r.data),

  getMyBookings: (status?: string): Promise<Booking[]> =>
    api.get('/bookings/my', { params: status ? { status } : undefined }).then(r => r.data),

  getById: (id: string): Promise<Booking> =>
    api.get(`/bookings/${id}`).then(r => r.data),

  updateStatus: (id: string, body: {
    status: 'Confirmed' | 'Cancelled' | 'Completed';
    meetingLink?: string;
    cancellationReason?: string;
  }): Promise<Booking> => api.put(`/bookings/${id}/status`, body).then(r => r.data),
};

// ════════════════════════════════════════════════════════════════════════════
// MESSAGING & CHAT
// ════════════════════════════════════════════════════════════════════════════
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  isRead: boolean;
  sentAt: string;
}

export interface Conversation {
  id: string;
  studentProfileId: string;
  studentName: string;
  studentAvatar?: string;
  tutorProfileId: string;
  tutorName: string;
  tutorAvatar?: string;
  subject?: string;
  lastMessage?: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
}

export const messagesApi = {
  getConversations: (): Promise<Conversation[]> =>
    api.get('/messages/conversations').then(r => r.data),

  getMessages: (conversationId: string): Promise<ChatMessage[]> =>
    api.get(`/messages/conversations/${conversationId}`).then(r => r.data),

  sendMessage: (conversationId: string, content: string): Promise<ChatMessage> =>
    api.post(`/messages/conversations/${conversationId}`, { content }).then(r => r.data),

  startConversation: (body: {
    tutorProfileId: string;
    subject?: string;
    initialMessage?: string;
  }): Promise<Conversation> => api.post('/messages/start', body).then(r => r.data),
};

// ════════════════════════════════════════════════════════════════════════════
// RAZORPAY CHECKOUT HELPER
// ════════════════════════════════════════════════════════════════════════════
export function openRazorpay(
  order: { orderId: string; amount: number; currency: string; key: string },
  meta: { type: 'subscription' | 'coin_purchase'; planId?: number; coinsAmount?: number }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = authApi.getUser();
    const opts = {
      key: order.key,
      amount: order.amount * 100,
      currency: order.currency,
      order_id: order.orderId,
      name: 'HomeTutor',
      description: meta.type === 'subscription' ? 'Subscription Plan' : 'Coin Purchase',
      prefill: { name: user?.fullName ?? '', email: user?.email ?? '' },
      theme: { color: '#0d9488' },
      handler: async (response: any) => {
        try {
          await paymentsApi.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            paymentType: meta.type,
            planId: meta.planId,
            coinsAmount: meta.coinsAmount,
          });
          resolve();
        } catch (e) {
          reject(e);
        }
      },
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    };
    if (typeof (window as any).Razorpay !== 'function') {
      reject(new Error('Razorpay checkout SDK is not loaded. Please check your internet connection or reload the page.'));
      return;
    }
    const rzp = new (window as any).Razorpay(opts);
    rzp.open();
  });
}
