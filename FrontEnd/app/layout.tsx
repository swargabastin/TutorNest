import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TutorNest - Find Your Perfect Tutor',
  description: 'Connect with verified, experienced tutors across India. Find the perfect tutor for school subjects, competitive exams, and skill development.',
  openGraph: {
    title: 'TutorNest - Find Your Perfect Tutor',
    description: 'Connect with verified, experienced tutors across India.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TutorNest - Find Your Perfect Tutor',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        {/* Required by lib/api.ts openRazorpay() — provides window.Razorpay */}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
