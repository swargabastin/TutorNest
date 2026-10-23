import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import MobileNav from '@/components/mobile-nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://tutor-nest-delta.vercel.app'),
  title: 'TutorNest - Find Your Perfect Tutor',
  description: 'Connect with verified, experienced tutors across India. Find the perfect tutor for school subjects, competitive exams, and skill development.',
  manifest: '/manifest.json',
  themeColor: '#164E63',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TutorNest',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
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
      <body className={`${inter.className} antialiased min-h-screen bg-[#F6F3EA] text-[#243238]`}>
        <div className="flex flex-col min-h-screen pb-[calc(3.5rem+env(safe-area-inset-bottom,0.5rem))] md:pb-0">
          {children}
        </div>
        <MobileNav />
        {/* Required by lib/api.ts openRazorpay() — provides window.Razorpay */}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        {/* Register lightweight PWA Service Worker */}
        <Script
          id="pwa-service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
