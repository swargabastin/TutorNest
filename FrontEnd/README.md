# TutorNest - Find Your Perfect Tutor

A modern, responsive tutoring platform connecting students with verified tutors across India. Built with Next.js, TypeScript, and Tailwind CSS.

![TutorNest Preview](https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop)

## Features

### For Students
- Search and filter tutors by subject, location, price, and rating
- View detailed tutor profiles with reviews
- Post tuition requirements
- Manage coin wallet for tutor contacts
- Subscribe to premium plans

### For Tutors
- Professional profile creation
- View student leads and requirements
- Manage classes and schedule
- Track earnings and student connections

### For Admins
- Platform analytics dashboard
- Manage tutors, students, and applications
- View transactions and revenue reports
- Approve/reject tutor applications

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Homepage with hero, features, testimonials |
| Student Registration | `/register/student` | Student signup form |
| Tutor Registration | `/register/tutor` | Tutor signup with subjects/qualifications |
| Find Tutors | `/search` | Search tutors with advanced filters |
| Post Requirement | `/post-requirement` | Post tuition needs |
| Student Dashboard | `/dashboard/student` | Student management panel |
| Tutor Dashboard | `/dashboard/tutor` | Tutor management panel |
| Admin Dashboard | `/dashboard/admin` | Admin control panel |
| Wallet | `/wallet` | Coin wallet management |
| Subscription | `/subscription` | Premium plan selection |
| Payment | `/payment` | Payment processing |
| Pricing | `/pricing` | Plan comparison |
| Tutor Profile | `/tutor/[id]` | Individual tutor page |

## Tech Stack

- **Framework:** Next.js 13 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **State:** React Hooks (mock data - no backend)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tutornest.git
cd tutornest

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── (main)/              # Public pages (landing, pricing)
│   ├── dashboard/           # Dashboard pages (student, tutor, admin)
│   ├── register/           # Registration pages
│   ├── search/             # Tutor search
│   ├── tutor/[id]/         # Tutor profile
│   ├── wallet/             # Coin wallet
│   ├── subscription/       # Subscription plans
│   └── payment/            # Payment processing
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── header.tsx          # Site header
│   ├── footer.tsx          # Site footer
│   ├── tutor-card.tsx      # Tutor display card
│   └── dashboard-sidebar.tsx
├── lib/
│   ├── mock-data.ts        # Mock data for demo
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utility functions
└── hooks/
    └── use-toast.ts        # Toast notifications
```

## Demo Accounts

The platform uses mock data for demonstration. Access dashboards directly:

- **Student Dashboard:** `/dashboard/student`
- **Tutor Dashboard:** `/dashboard/tutor`
- **Admin Dashboard:** `/dashboard/admin`

## Key Features Implemented

- Responsive design (mobile, tablet, desktop)
- Advanced tutor search with filters
- Coin-based contact system
- Subscription plans with tiered features
- Role-based dashboard interfaces
- Real-time form validation
- Beautiful UI with animations

## Future Enhancements

- Backend API integration (Supabase ready)
- Real authentication system
- Payment gateway integration (Razorpay/Stripe)
- Video calling for online classes
- Chat/messaging system
- Push notifications
- Mobile app (React Native)

## License

MIT License - feel free to use for your own projects.

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

Built with Next.js and Tailwind CSS
