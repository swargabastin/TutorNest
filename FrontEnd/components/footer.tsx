import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1C081E] text-ivory-100/80 border-t border-plum-900/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2.5 mb-3.5">
              <div className="w-9 h-9 bg-gradient-to-br from-plum-600 to-plum-900 rounded-xl flex items-center justify-center">
                <span className="text-ivory-50 font-bold text-lg">T</span>
              </div>
              <span className="text-lg font-bold text-ivory-50 tracking-tight">TutorNest</span>
            </div>
            <p className="text-sm text-ivory-200/70 mb-4 leading-relaxed">
              India&apos;s verified platform for 1-on-1 home and online tutoring. Real tutors, measurable learning.
            </p>
            <div className="flex space-x-3 text-ivory-300">
              <a href="#" aria-label="Facebook" className="p-1.5 rounded-lg bg-plum-950/80 hover:text-lavender-300 hover:bg-plum-900 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Twitter" className="p-1.5 rounded-lg bg-plum-950/80 hover:text-lavender-300 hover:bg-plum-900 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="p-1.5 rounded-lg bg-plum-950/80 hover:text-lavender-300 hover:bg-plum-900 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="p-1.5 rounded-lg bg-plum-950/80 hover:text-lavender-300 hover:bg-plum-900 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-ivory-50 uppercase tracking-wider mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-ivory-200/70">
              <li><Link href="/search" className="hover:text-lavender-300 transition-colors">Find Tutors</Link></li>
              <li><Link href="/post-requirement" className="hover:text-lavender-300 transition-colors">Post Requirement</Link></li>
              <li><Link href="/register/tutor" className="hover:text-lavender-300 transition-colors">Become a Tutor</Link></li>
              <li><Link href="/pricing" className="hover:text-lavender-300 transition-colors">Pricing Plans</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-ivory-50 uppercase tracking-wider mb-3">Support & Legal</h3>
            <ul className="space-y-2 text-sm text-ivory-200/70">
              <li><Link href="/terms" className="hover:text-lavender-300 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-lavender-300 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-lavender-300 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold text-ivory-50 uppercase tracking-wider mb-3">Contact</h3>
            <ul className="space-y-2.5 text-sm text-ivory-200/70">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-lavender-300 shrink-0" />
                <span className="truncate">support@tutornest.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-lavender-300 shrink-0" />
                <span>+91 1800 123 4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-lavender-300 shrink-0 mt-0.5" />
                <span>India &bull; Online &amp; In-Person</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-plum-900/80 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-ivory-300/60 gap-3">
          <p>&copy; {new Date().getFullYear()} TutorNest Education Technologies. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/refund-policy" className="hover:underline">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
