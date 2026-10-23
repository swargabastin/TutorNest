import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0E3342] text-ivory-100/80 border-t border-plum-900/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center justify-between sm:justify-start sm:space-x-2.5 mb-2 sm:mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-plum-600 to-plum-900 rounded-lg flex items-center justify-center">
                  <span className="text-ivory-50 font-bold text-base">T</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-ivory-50 tracking-tight">TutorNest</span>
              </div>
              <div className="flex space-x-2 text-ivory-300 md:hidden">
                <a href="#" aria-label="Facebook" className="p-1 rounded-md bg-plum-950/80 hover:text-lavender-300 transition-colors">
                  <Facebook className="h-3.5 w-3.5" />
                </a>
                <a href="#" aria-label="Twitter" className="p-1 rounded-md bg-plum-950/80 hover:text-lavender-300 transition-colors">
                  <Twitter className="h-3.5 w-3.5" />
                </a>
                <a href="#" aria-label="Instagram" className="p-1 rounded-md bg-plum-950/80 hover:text-lavender-300 transition-colors">
                  <Instagram className="h-3.5 w-3.5" />
                </a>
                <a href="#" aria-label="LinkedIn" className="p-1 rounded-md bg-plum-950/80 hover:text-lavender-300 transition-colors">
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-ivory-200/70 mb-3 sm:mb-4 leading-relaxed">
              India&apos;s verified platform for 1-on-1 home and online tutoring.
            </p>
            <div className="hidden md:flex space-x-3 text-ivory-300">
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
            <h3 className="text-xs sm:text-sm font-semibold text-ivory-50 uppercase tracking-wider mb-2 sm:mb-3">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-ivory-200/70">
              <li><Link href="/search" className="hover:text-lavender-300 transition-colors">Find Tutors</Link></li>
              <li><Link href="/post-requirement" className="hover:text-lavender-300 transition-colors">Post Need</Link></li>
              <li><Link href="/register/tutor" className="hover:text-lavender-300 transition-colors">Become a Tutor</Link></li>
              <li><Link href="/pricing" className="hover:text-lavender-300 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-ivory-50 uppercase tracking-wider mb-2 sm:mb-3">Legal &amp; Policy</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-ivory-200/70">
              <li><Link href="/terms" className="hover:text-lavender-300 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-lavender-300 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-lavender-300 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xs sm:text-sm font-semibold text-ivory-50 uppercase tracking-wider mb-2 sm:mb-3">Contact</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-ivory-200/70">
              <li className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-lavender-300 shrink-0" />
                <span className="truncate">support@tutornest.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-lavender-300 shrink-0" />
                <span>+91 1800 123 4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-3.5 w-3.5 text-lavender-300 shrink-0" />
                <span>India &bull; Online &amp; In-Person</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-plum-900/80 mt-5 sm:mt-8 pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] sm:text-xs text-ivory-300/60 gap-2">
          <p>&copy; {new Date().getFullYear()} TutorNest Education Technologies.</p>
          <div className="flex gap-3">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/refund-policy" className="hover:underline">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
