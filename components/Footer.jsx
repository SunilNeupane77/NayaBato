"use client";

import { useLanguage } from '@/lib/i18n/language-context';
import { Facebook, Instagram, Linkedin, Mail, Phone, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-400 pt-12 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* About Section */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">{t('common.appName')}</h3>
            <p className="text-sm leading-relaxed">
              {t('footer.about')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/issues" className="hover:text-white transition-colors duration-300">{t('footer.activeIssues')}</Link></li>
              <li><Link href="/issues/report" className="hover:text-white transition-colors duration-300">{t('footer.reportIssue')}</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors duration-300">{t('footer.aboutUs')}</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors duration-300">{t('footer.signUp')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors duration-300">{t('footer.privacyPolicy')}</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors duration-300">{t('footer.termsOfService')}</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">{t('footer.connectWithUs')}</h3>
            <div className="flex items-center mb-3">
              <Mail size={18} className="mr-3" />
              <span className="text-sm">sunilneupane957@gmail.com</span>
            </div>
            <div className="flex items-center mb-4">
              <Phone size={18} className="mr-3" />
              <span className="text-sm">9860137848</span>
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
          <p>&copy; {currentYear} {t('common.appName')}. {t('footer.rights')}</p>
          <p className="mt-4 md:mt-0">{t('footer.designedWith')}</p>
        </div>
      </div>
    </footer>
  );
}
