'use client';

import { Building2, Heart, Users, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/language-context';

export default function AboutPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('about.title')}</h1>
          <p className="text-xl md:text-2xl text-teal-100 mb-8 leading-relaxed">
            {t('about.tagline')}
          </p>
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl">
              <p className="text-lg text-white/90 leading-relaxed">
                {t('about.intro')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Mission Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-6">
            <Target className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-3xl font-bold mb-6 text-gray-900">{t('about.missionTitle')}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('about.missionText')}
          </p>
        </div>

        {/* How We Help Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">{t('about.helpTitle')}</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* For Citizens */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">{t('about.forCitizensTitle')}</h3>
                </div>
                <div className="space-y-4">
                  {[
                    t('about.citizenBenefit1'),
                    t('about.citizenBenefit2'),
                    t('about.citizenBenefit3'),
                    t('about.citizenBenefit4')
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-gray-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* For Government */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">{t('about.forGovernmentTitle')}</h3>
                </div>
                <div className="space-y-4">
                  {[
                    t('about.governmentBenefit1'),
                    t('about.governmentBenefit2'),
                    t('about.governmentBenefit3'),
                    t('about.governmentBenefit4')
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-gray-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Get Involved Section */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-8 md:p-12 mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-6">
              <Heart className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">{t('about.getInvolvedTitle')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('about.getInvolvedText')}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700">
              <Link href="/auth/register" className="flex items-center gap-2">
                {t('about.createAccount')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-teal-600 text-teal-600 hover:bg-teal-50">
              <Link href="/issues/report">{t('about.reportIssue')}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="mailto:sunilneupane957@gmail.com">{t('about.contactUs')}</a>
            </Button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">{t('about.ctaTitle')}</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('about.ctaText')}
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-3">
            <Link href="/auth/register" className="flex items-center gap-2">
              {t('about.getStarted')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
