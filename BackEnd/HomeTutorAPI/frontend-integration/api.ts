/**
 * HomeTutor API Client
 * Drop this file into your Bolt.new project at: lib/api.ts
 * Replace all imports of '@/lib/mock-data' with calls from this file.
 *
 * Setup:
 *   1. npm install axios
 *   2. Create .env.local → NEXT_PUBLIC_API_URL=http://localhost:5000/api
 */

import axios, { AxiosError } from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

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
        const rt = localStorage.getItem('refreshToken');
        if (!rt) throw new Error('no refresh token');
        const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken: rt });
        localStorage.setItem('accessToken',  data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

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
      localStorage.setItem('accessToken',  d.accessToken);
      localStorage.setItem('refreshToken', d.refreshToken);
      localStorage.setItem('user',         JSON.stringify(d.user));
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
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  },

  isLoggedIn: () => !!localStorage.getItem('accessToken'),
};

// ════════════════════════════════════════════════════════════════════════════
// LOOKUPS  (subjects, cities — replaces mock-data arrays)
// ════════════════════════════════════════════════════════════════════════════
export const lookupsApi = {
  /** Replaces: import { subjects } from '@/lib/mock-data' */
  getSubjects: () =>
    api.get('/lookups/subjects').then(r => r.data as { id: number; name: string; category?: string }[]),

  /** Replaces: import { cities } from '@/lib/mock-data' */
  getCities: () =>
    api.get('/lookups/cities').then(r => r.data as { id: number; city: string; state?: string }[]),

  /** Replaces: import { teachingLevels } from '@/lib/mock-data' */
  getTeachingLevels: () =>
    api.get('/lookups/teaching-levels').then(r => r.data as string[]),
};

// ════════════════════════════════════════════════════════════════════════════
// TUTORS  (replaces import { tutors } from '@/lib/mock-data')
// ════════════════════════════════════════════════════════════════════════════
export const tutorsApi = {
  /** Search page — replaces: tutors.filter(...) */
  search: (params: {
    search?: string; city?: string; subject?: string; level?: string;
    mode?: string[]; minRate?: number; maxRate?: number; minRating?: number;
    verifiedOnly?: boolean; sortBy?: string; page?: number; pageSize?: number;
  }) => api.get('/tutors/search', { params }).then(r => r.data),

  /** Tutor profile page — replaces: tutors.find(t => t.id === id) */
  getById: (id: string) =>
    api.get(`/tutors/${id}`).then(r => r.data),

  /** Tutor dashboard — my profile */
  getMyProfile: () =>
    api.get('/tutors/me').then(r => r.data),

  updateProfile: (body: {
    qualification?: string; experienceYears?: number; bio?: string;
    teachingMode?: string; hourlyRate?: number; subjectIds?: number[];
    teachingLevels?: string[]; languages?: string[]; responseTime?: string;
  }) => api.put('/tutors/me', body).then(r => r.data),

  uploadProfileImage: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/tutors/me/profile-image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data as { url: string });
  },

  getStats: () =>
    api.get('/tutors/me/stats').then(r => r.data),

  getWallet: () =>
    api.get('/tutors/me/wallet').then(r => r.data),

  getEnquiries: () =>
    api.get('/tutors/me/enquiries').then(r => r.data),

  setAvailability: (slots: { dayOfWeek: number; startTime: string; endTime: string }[]) =>
    api.put('/tutors/me/availability', { slots }).then(r => r.data),
};

// ════════════════════════════════════════════════════════════════════════════
// STUDENTS
// ════════════════════════════════════════════════════════════════════════════
export const studentsApi = {
  getProfile: () =>
    api.get('/students/me').then(r => r.data),

  getStats: () =>
    api.get('/students/me/stats').then(r => r.data),

  /** Post-requirement page — replaces: setSubmitted(true) */
  postRequirement: (body: {
    subject: string; level: string; city?: string;
    mode: string; budget?: string; frequencyPerWeek?: number; description?: string;
  }) => api.post('/students/me/requirements', body).then(r => r.data),

  getRequirements: () =>
    api.get('/students/me/requirements').then(r => r.data),

  closeRequirement: (id: string) =>
    api.delete(`/students/me/requirements/${id}`).then(r => r.data),

  /** Contact tutor form */
  sendEnquiry: (body: {
    tutorProfileId: string; subject: string; level: string; message?: string;
  }) => api.post('/students/me/enquiries', body).then(r => r.data),

  getEnquiries: () =>
    api.get('/students/me/enquiries').then(r => r.data),

  /** Submit review on tutor profile page */
  submitReview: (body: { tutorProfileId: string; rating: number; reviewText?: string }) =>
    api.post('/students/me/reviews', body).then(r => r.data),

  getWallet: () =>
    api.get('/students/me/wallet').then(r => r.data),
};

// ════════════════════════════════════════════════════════════════════════════
// PAYMENTS & SUBSCRIPTIONS
// ════════════════════════════════════════════════════════════════════════════
export const paymentsApi = {
  /** Subscription/pricing page — replaces: import { subscriptions } from '@/lib/mock-data' */
  getPlans: () =>
    api.get('/payments/plans').then(r => r.data),

  /** Wallet page — replaces: const coinPackages = [...] */
  getCoinPackages: () =>
    api.get('/payments/coin-packages').then(r => r.data),

  /** Step 1 — create Razorpay order */
  createOrder: (body: { planId?: number; coinPackageAmount?: number }) =>
    api.post('/payments/create-order', body).then(r => r.data as {
      orderId: string; amount: number; currency: string; key: string;
    }),

  /** Step 2 — verify payment and credit coins */
  verifyPayment: (body: {
    razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string;
    paymentType: 'subscription' | 'coin_purchase'; planId?: number; coinsAmount?: number;
  }) => api.post('/payments/verify', body).then(r => r.data),
};

// ════════════════════════════════════════════════════════════════════════════
// ADMIN
// ════════════════════════════════════════════════════════════════════════════
export const adminApi = {
  getDashboard: () =>
    api.get('/admin/dashboard').then(r => r.data),

  getTutors: (params?: { status?: string; page?: number; pageSize?: number }) =>
    api.get('/admin/tutors', { params }).then(r => r.data),

  updateTutorStatus: (id: string, status: 'Approved' | 'Rejected') =>
    api.put(`/admin/tutors/${id}/status`, { status }).then(r => r.data),

  getUsers: (params?: { search?: string; role?: string; page?: number; pageSize?: number }) =>
    api.get('/admin/users', { params }).then(r => r.data),

  toggleUser: (id: string) =>
    api.put(`/admin/users/${id}/toggle`).then(r => r.data),

  getPayments: (params?: { page?: number; pageSize?: number }) =>
    api.get('/admin/payments', { params }).then(r => r.data),

  getRequirements: (params?: { page?: number; pageSize?: number }) =>
    api.get('/admin/requirements', { params }).then(r => r.data),
};

// ════════════════════════════════════════════════════════════════════════════
// RAZORPAY CHECKOUT HELPER
// ════════════════════════════════════════════════════════════════════════════
/**
 * Opens the Razorpay checkout modal.
 * Usage:
 *   const order = await paymentsApi.createOrder({ planId: 3 });
 *   await openRazorpay(order, { type: 'subscription', planId: 3 });
 */
export function openRazorpay(
  order: { orderId: string; amount: number; currency: string; key: string },
  meta:  { type: 'subscription' | 'coin_purchase'; planId?: number; coinsAmount?: number }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = authApi.getUser();
    const opts = {
      key:         order.key,
      amount:      order.amount * 100,
      currency:    order.currency,
      order_id:    order.orderId,
      name:        'HomeTutor',
      description: meta.type === 'subscription' ? 'Subscription Plan' : 'Coin Purchase',
      prefill:     { name: user?.fullName ?? '', email: user?.email ?? '' },
      theme:       { color: '#0d9488' },
      handler: async (response: any) => {
        try {
          await paymentsApi.verifyPayment({
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            paymentType:       meta.type,
            planId:            meta.planId,
            coinsAmount:       meta.coinsAmount,
          });
          resolve();
        } catch (e) {
          reject(e);
        }
      },
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    };
    const rzp = new (window as any).Razorpay(opts);
    rzp.open();
  });
}
