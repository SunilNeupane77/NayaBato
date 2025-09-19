"use client";

import { useLanguage } from '@/lib/i18n/language-context';
import { Facebook, Instagram, Linkedin, Mail, Phone, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-400 pt-8 sm:pt-12 mt-auto safe-area-bottom">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {/* About Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{t('common.appName')}</h3>
            <p className="text-sm leading-relaxed">
              {t('footer.about')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              <li><Link href="/issues" className="hover:text-white transition-colors duration-300 touch-target block py-1">{t('footer.activeIssues')}</Link></li>
              <li><Link href="/issues/report" className="hover:text-white transition-colors duration-300 touch-target block py-1">{t('footer.reportIssue')}</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors duration-300 touch-target block py-1">{t('footer.aboutUs')}</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors duration-300 touch-target block py-1">{t('footer.signUp')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors duration-300 touch-target block py-1">{t('footer.privacyPolicy')}</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors duration-300 touch-target block py-1">{t('footer.termsOfService')}</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">{t('footer.connectWithUs')}</h3>
            <div className="flex items-center mb-2 sm:mb-3">
              <Mail size={16} className="mr-2 sm:mr-3 flex-shrink-0" />
              <span className="text-xs sm:text-sm break-all">sunilneupane957@gmail.com</span>
            </div>
            <div className="flex items-center mb-3 sm:mb-4">
              <Phone size={16} className="mr-2 sm:mr-3 flex-shrink-0" />
              <span className="text-xs sm:text-sm">9860137848</span>
            </div>
            <div className="flex space-x-3 sm:space-x-4 mt-3 sm:mt-4">
              <a href="#" className="hover:text-white transition-colors duration-300 touch-target p-1"><Facebook size={20} /></a>
              <a href="#" className="hover:text-white transition-colors duration-300 touch-target p-1"><Twitter size={20} /></a>
              <a href="#" className="hover:text-white transition-colors duration-300 touch-target p-1"><Instagram size={20} /></a>
              <a href="#" className="hover:text-white transition-colors duration-300 touch-target p-1"><Linkedin size={20} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-10 pt-4 sm:pt-6 pb-6 sm:pb-8 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-500 gap-2 sm:gap-0">
          <p className="text-center sm:text-left">&copy; {currentYear} {t('common.appName')}. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
