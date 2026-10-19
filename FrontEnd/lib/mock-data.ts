import { Tutor, Student, TuitionRequirement, Subscription, Transaction, TutorApplication } from './types';

export const tutors: Tutor[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    subjects: ['Mathematics', 'Physics'],
    experience: 8,
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 500,
    location: 'Mumbai',
    mode: ['both'],
    qualification: 'M.Sc Mathematics, IIT Bombay',
    bio: 'Passionate educator with 8+ years of experience in teaching Mathematics and Physics. Specializes in JEE preparation and board exams.',
    verified: true,
    languages: ['English', 'Hindi'],
    teachingLevels: ['Class 9-10', 'Class 11-12', 'JEE', 'NEET'],
    responseTime: 'Within 2 hours',
    studentsTaught: 234
  },
  {
    id: '2',
    name: 'Rahul Verma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    subjects: ['Chemistry', 'Biology'],
    experience: 6,
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 450,
    location: 'Delhi',
    mode: ['online'],
    qualification: 'Ph.D. Chemistry, Delhi University',
    bio: 'NEET specialist with proven track record. My students have consistently scored above 600 in NEET.',
    verified: true,
    languages: ['English', 'Hindi'],
    teachingLevels: ['Class 11-12', 'NEET'],
    responseTime: 'Within 1 hour',
    studentsTaught: 156
  },
  {
    id: '3',
    name: 'Anjali Patel',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    subjects: ['English', 'Social Studies'],
    experience: 5,
    rating: 4.7,
    reviewCount: 64,
    hourlyRate: 350,
    location: 'Bangalore',
    mode: ['offline'],
    qualification: 'M.A. English, Bangalore University',
    bio: 'Dedicated teacher focusing on language skills and social sciences. Help students build strong foundations.',
    verified: true,
    languages: ['English', 'Kannada', 'Hindi'],
    teachingLevels: ['Class 1-5', 'Class 6-8', 'Class 9-10'],
    responseTime: 'Within 3 hours',
    studentsTaught: 98
  },
  {
    id: '4',
    name: 'Dr. Amit Kumar',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop',
    subjects: ['Mathematics', 'Computer Science'],
    experience: 12,
    rating: 4.9,
    reviewCount: 203,
    hourlyRate: 700,
    location: 'Hyderabad',
    mode: ['both'],
    qualification: 'Ph.D. Computer Science, IIT Hyderabad',
    bio: 'Expert in competitive programming and advanced mathematics. Helped 50+ students crack coding interviews.',
    verified: true,
    languages: ['English', 'Telugu', 'Hindi'],
    teachingLevels: ['Class 11-12', 'JEE', 'College', 'Programming'],
    responseTime: 'Within 30 mins',
    studentsTaught: 412
  },
  {
    id: '5',
    name: 'Sneha Reddy',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654959?w=150&h=150&fit=crop',
    subjects: ['Spanish', 'French'],
    experience: 4,
    rating: 4.6,
    reviewCount: 45,
    hourlyRate: 600,
    location: 'Chennai',
    mode: ['online'],
    qualification: 'DELE C2 (Spanish), DALF C1 (French)',
    bio: 'Native-level fluency in Spanish and French. Offer conversational and exam-focused classes.',
    verified: false,
    languages: ['English', 'Spanish', 'French', 'Tamil'],
    teachingLevels: ['Beginner', 'Intermediate', 'Advanced'],
    responseTime: 'Within 4 hours',
    studentsTaught: 67
  },
  {
    id: '6',
    name: 'Vikram Singh',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994da43?w=150&h=150&fit=crop',
    subjects: ['Physics', 'Mathematics'],
    experience: 10,
    rating: 4.8,
    reviewCount: 156,
    hourlyRate: 550,
    location: 'Pune',
    mode: ['both'],
    qualification: 'M.Sc Physics, IISc Bangalore',
    bio: 'Research scientist turned educator. Makes complex concepts simple with real-world examples.',
    verified: true,
    languages: ['English', 'Hindi', 'Marathi'],
    teachingLevels: ['Class 9-10', 'Class 11-12', 'JEE', 'Olympiad'],
    responseTime: 'Within 1 hour',
    studentsTaught: 289
  }
];

export const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Social Studies',
  'Computer Science',
  'Spanish',
  'French',
  'German',
  'Accounting',
  'Economics',
  'Business Studies'
];

export const cities = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad'
];

export const teachingLevels = [
  'Class 1-5',
  'Class 6-8',
  'Class 9-10',
  'Class 11-12',
  'JEE',
  'NEET',
  'College',
  'Programming',
  'Language Learning'
];

export const mockStudent: Student = {
  id: 'stu1',
  name: 'Ravi Kumar',
  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd9b?w=150&h=150&fit=crop',
  email: 'ravi.kumar@email.com',
  phone: '+91 98765 43210',
  location: 'Mumbai',
  joinedDate: '2024-01-15',
  coins: 2450,
  subscription: null,
  requirements: [
    {
      id: 'req1',
      subject: 'Mathematics',
      level: 'Class 10',
      location: 'Mumbai',
      mode: 'both',
      budget: '₹400-600/hour',
      description: 'Need a tutor for CBSE Class 10 Mathematics. Student needs help with trigonometry and Algebra.',
      status: 'active',
      createdAt: '2024-03-10',
      responses: 5
    },
    {
      id: 'req2',
      subject: 'Physics',
      level: 'Class 12',
      location: 'Mumbai',
      mode: 'online',
      budget: '₹500-700/hour',
      description: 'Looking for JEE-level Physics tutor for Class 12 student.',
      status: 'closed',
      createdAt: '2024-02-20',
      responses: 8
    }
  ]
};

export const subscriptions: Subscription[] = [
  {
    id: 'sub1',
    name: 'Basic',
    price: 299,
    coinsPerMonth: 100,
    features: ['10 Tutor Contacts', '5 Requirements/Month', 'Email Support']
  },
  {
    id: 'sub2',
    name: 'Pro',
    price: 599,
    coinsPerMonth: 250,
    features: ['25 Tutor Contacts', '15 Requirements/Month', 'Priority Support', 'Featured Profile']
  },
  {
    id: 'sub3',
    name: 'Premium',
    price: 999,
    coinsPerMonth: 500,
    features: ['Unlimited Contacts', 'Unlimited Requirements', '24/7 Support', 'Featured Profile', 'Verified Badge', 'Exclusive Leads']
  }
];

export const transactions: Transaction[] = [
  {
    id: 'txn1',
    type: 'credit',
    amount: 500,
    description: 'Purchased 500 coins',
    date: '2024-03-15',
    balance: 2450
  },
  {
    id: 'txn2',
    type: 'debit',
    amount: 50,
    description: 'Contacted tutor Priya Sharma',
    date: '2024-03-12',
    balance: 1950
  },
  {
    id: 'txn3',
    type: 'credit',
    amount: 200,
    description: 'Welcome bonus',
    date: '2024-01-15',
    balance: 200
  }
];

export const applications: TutorApplication[] = [
  {
    id: 'app1',
    name: 'Meera Joshi',
    email: 'meera.joshi@email.com',
    phone: '+91 87654 32109',
    subjects: ['Biology', 'Chemistry'],
    qualification: 'M.Sc Biotechnology',
    experience: 3,
    status: 'pending',
    appliedDate: '2024-03-18'
  },
  {
    id: 'app2',
    name: 'Suresh Nair',
    email: 'suresh.nair@email.com',
    phone: '+91 76543 21098',
    subjects: ['Mathematics'],
    qualification: 'B.Ed Mathematics',
    experience: 5,
    status: 'approved',
    appliedDate: '2024-03-10'
  },
  {
    id: 'app3',
    name: 'Kavita Rao',
    email: 'kavita.rao@email.com',
    phone: '+91 65432 10987',
    subjects: ['English', 'Hindi'],
    qualification: 'M.A English Literature',
    experience: 2,
    status: 'rejected',
    appliedDate: '2024-03-05'
  }
];

export const dashboardStats = {
  totalTutors: 15420,
  totalStudents: 45890,
  activeRequirements: 2340,
  totalTransactions: 125000,
  monthlyRevenue: 897500
};

export const revenueData = [
  { month: 'Jan', revenue: 650000 },
  { month: 'Feb', revenue: 720000 },
  { month: 'Mar', revenue: 810000 },
  { month: 'Apr', revenue: 780000 },
  { month: 'May', revenue: 890000 },
  { month: 'Jun', revenue: 897500 }
];

export const userGrowthData = [
  { month: 'Jan', tutors: 12000, students: 38000 },
  { month: 'Feb', tutors: 13200, students: 40500 },
  { month: 'Mar', tutors: 14100, students: 43000 },
  { month: 'Apr', tutors: 14800, students: 44200 },
  { month: 'May', tutors: 15200, students: 45500 },
  { month: 'Jun', tutors: 15420, students: 45890 }
];
