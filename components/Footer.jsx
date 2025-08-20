import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-12 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* About Section */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">Nayabato</h3>
            <p className="text-sm leading-relaxed">
              A community-driven platform to report and resolve civic issues, promoting a transparent and accountable governance model.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/issues" className="hover:text-white transition-colors duration-300">Active Issues</Link></li>
              <li><Link href="/issues/report" className="hover:text-white transition-colors duration-300">Report an Issue</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors duration-300">About Us</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors duration-300">Sign Up</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors duration-300">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors duration-300">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Connect With Us</h3>
            <div className="flex items-center mb-3">
              <Mail size={18} className="mr-3" />
              <span className="text-sm">info@nayabato.com</span>
            </div>
            <div className="flex items-center mb-4">
              <Phone size={18} className="mr-3" />
              <span className="text-sm">+1 (555) 123-4567</span>
            </div>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-white transition-colors duration-300"><Facebook size={22} /></a>
              <a href="#" className="hover:text-white transition-colors duration-300"><Twitter size={22} /></a>
              <a href="#" className="hover:text-white transition-colors duration-300"><Instagram size={22} /></a>
              <a href="#" className="hover:text-white transition-colors duration-300"><Linkedin size={22} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 pb-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Nayabato. All Rights Reserved.</p>
          <p className="mt-4 md:mt-0">Designed with ❤️ by the Nayabato Team</p>
        </div>
      </div>
    </footer>
  );
}
