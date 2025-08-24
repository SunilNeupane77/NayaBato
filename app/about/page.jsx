'use client';

import { Cpu, Users } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/lib/i18n/language-context';

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('about.title')}</h1>
        <p className="text-lg text-gray-600">
          {t('about.tagline')}
        </p>
      </div>
      
      <div className="prose prose-blue max-w-none mb-16">
        <p className="lead text-lg">
          {t('about.intro')}
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4">{t('about.missionTitle')}</h2>
        <p>
          {t('about.missionText')}
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4">{t('about.helpTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold">{t('about.forCitizensTitle')}</h3>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>{t('about.citizenBenefit1')}</li>
              <li>{t('about.citizenBenefit2')}</li>
              <li>{t('about.citizenBenefit3')}</li>
              <li>{t('about.citizenBenefit4')}</li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Cpu className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold">{t('about.forGovernmentTitle')}</h3>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>{t('about.governmentBenefit1')}</li>
              <li>{t('about.governmentBenefit2')}</li>
              <li>{t('about.governmentBenefit3')}</li>
              <li>{t('about.governmentBenefit4')}</li>
            </ul>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-12 mb-4">{t('about.technologyTitle')}</h2>
        <p>
          {t('about.technologyIntro')}
        </p>
        <ul className="list-disc list-inside my-4 text-gray-700 space-y-2">
          <li>{t('about.technology1')}</li>
          <li>{t('about.technology2')}</li>
          <li>{t('about.technology3')}</li>
          <li>{t('about.technology4')}</li>
          <li>{t('about.technology5')}</li>
        </ul>

        <h2 className="text-2xl font-bold mt-12 mb-4">{t('about.getInvolvedTitle')}</h2>
        <p>
          {t('about.getInvolvedText')}
        </p>
        <div className="flex flex-wrap gap-4 my-8">
          <Button asChild>
            <Link href="/auth/register">{t('about.createAccount')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/issues/report">{t('about.reportIssue')}</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="mailto:contact@nayabato.com">{t('about.contactUs')}</a>
          </Button>
        </div>
      </div>
      
      <Separator className="my-12" />
      
      <div className="text-center">
        <h3 className="text-xl font-bold mb-4">{t('about.ctaTitle')}</h3>
        <p className="text-gray-600 mb-8">
          {t('about.ctaText')}
        </p>
        <Button asChild size="lg">
          <Link href="/auth/register">{t('about.getStarted')}</Link>
        </Button>
      </div>
    </div>
  );
}
