"use client";

import { useLanguage } from '@/lib/i18n/language-context';
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BadgeCheck, BarChart3, Camera, CheckCircle, Clock, Edit, Mail, Map, MapPin, Share2, Shield, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Animations
const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeInFromRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7 } },
};

const fadeInFromLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7 } },
};

const popIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

// Feature Card
const FeatureCard = ({ icon, title, children }) => (
  <motion.div
    variants={fadeIn}
    className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-teal-500/20 transition-all"
  >
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center mb-5 shadow-md">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600 text-sm">{children}</p>
  </motion.div>
);

// Stat Card
const StatCard = ({ number, label, icon }) => (
  <motion.div
    variants={fadeIn}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-lg bg-teal-50 text-teal-600">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-800">{number}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  </motion.div>
);

// Logo Component
const PartnerLogo = ({ src, alt, width = 120, height = 40 }) => (
  <div className="opacity-80 hover:opacity-100 transition-opacity">
    <Image 
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="h-10 w-auto object-contain"
    />
  </div>
);

export default function HomePage() {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section with Abstract Shapes */}
      <motion.section
        className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-indigo-600 text-white py-28"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Enhanced Abstract Shapes with More Dynamic Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-teal-400 opacity-20 blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-indigo-500 opacity-20 blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-cyan-400 opacity-20 blur-3xl animate-pulse-slow"></div>
          
          {/* Added floating elements */}
          <div className="absolute top-1/4 right-1/4 w-12 h-12 rounded-lg bg-white opacity-10 animate-float-slow rotate-12"></div>
          <div className="absolute bottom-1/4 left-1/3 w-16 h-16 rounded-full bg-white opacity-10 animate-float-medium"></div>
          <div className="absolute top-2/3 right-1/5 w-8 h-8 rounded-md bg-white opacity-10 animate-float-fast -rotate-12"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('/images/hero/grid-pattern.svg')] opacity-10"></div>
        </div>

        <div className="container relative z-10 mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <motion.div
            variants={fadeInFromLeft}
            className="md:w-1/2 text-center md:text-left"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm mb-6">
              <span className="animate-pulse w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
              <span className="text-sm font-medium text-white/90">{t('home.hero.announcement')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              {t('home.hero.heading')}
            </h1>
            <p className="text-lg md:text-xl mb-10 text-teal-100/90 max-w-xl mx-auto md:mx-0">
              {t('home.hero.description')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-8">
              <Button
                asChild
                size="lg"
                className="bg-white text-indigo-700 hover:bg-teal-50 font-semibold hover:scale-105 transition-transform shadow-lg"
              >
                <Link href="/issues/report">{t('home.hero.reportButton')}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/80 bg-orange-600 text-black hover:bg-white/20 font-semibold transition-colors"
              >
                <Link href="/issues">{t('home.hero.viewButton')}</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div variants={fadeInFromRight} className="md:w-1/2 flex justify-center relative">
            {/* Enhanced Device Frame with Dashboard */}
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-pink-400 to-red-500 rounded-lg rotate-12 opacity-70 blur-xl animate-pulse-slow"></div>
              <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg -rotate-12 opacity-70 blur-xl animate-pulse-slow"></div>
              <div className="absolute top-1/2 right-full mr-8 w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-60 blur-lg animate-float-medium"></div>
              <div className="absolute bottom-1/4 left-full ml-8 w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg opacity-60 blur-lg animate-float-slow rotate-45"></div>
              
              {/* Main dashboard mockup */}
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-8 border-white w-full max-w-md">
                <div className="relative bg-gray-50 p-1 rounded-t-lg border-b border-gray-200 flex items-center">
                  <div className="flex space-x-1 ml-2">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                  <div className="mx-auto text-xs text-gray-500 font-medium">{t('common.appName')} {t('navigation.dashboard')}</div>
                </div>
                <Image
                  src="/images/dashboard-preview.svg"
                  alt={t('home.hero.dashboardPreview')}
                  width={500}
                  height={300}
                  className="w-full"
                  priority
                />
              </div>
              
              {/* Floating notification card */}
              <motion.div 
                variants={popIn}
                className="absolute -top-4 -right-8 bg-white rounded-lg shadow-xl p-3 w-40 border border-gray-100 rotate-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium text-gray-600">{t('home.hero.issueResolved')}</span>
                </div>
                <div className="text-xs text-gray-500">{t('home.hero.waterPipeFixed')}</div>
              </motion.div>
              
              {/* Floating chart/stats element */}
              <motion.div
                variants={popIn} 
                className="absolute -bottom-4 right-0 bg-white rounded-lg shadow-lg p-3 border border-gray-100 -rotate-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-3 h-3 text-teal-500" />
                  <span className="text-xs font-semibold text-gray-700">{t('home.hero.resolutionRate')}</span>
                </div>
                <div className="flex gap-1 items-end mt-1">
                  <div className="w-3 h-8 bg-teal-200 rounded-sm"></div>
                  <div className="w-3 h-5 bg-teal-300 rounded-sm"></div>
                  <div className="w-3 h-12 bg-teal-400 rounded-sm"></div>
                  <div className="w-3 h-7 bg-teal-500 rounded-sm"></div>
                  <div className="w-3 h-10 bg-teal-600 rounded-sm"></div>
                </div>
                <div className="text-xs mt-1 text-right text-gray-500">{t('home.hero.thisWeek')}</div>
              </motion.div>
              
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works - Enhanced with More Visual Elements */}
      <motion.section
        className="py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-teal-50 text-teal-700 rounded-full px-4 py-1.5 mb-4 font-medium text-sm">
              <Zap size={16} className="mr-2" />
              {t('home.process.sectionHeading')}
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('home.process.sectionTitle')}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('home.process.sectionDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              {
                title: t('home.process.step1Title'),
                desc: t('home.process.step1Desc'),
                icon: <AlertTriangle className="h-7 w-7 text-white" />,
                color: "from-teal-400 to-teal-600",
                image: "/images/report-issue.svg"
              },
              {
                title: t('home.process.step2Title'),
                desc: t('home.process.step2Desc'),
                icon: <Clock className="h-7 w-7 text-white" />,
                color: "from-amber-400 to-amber-600",
                image: "/images/track-issue.svg"
              },
              {
                title: t('home.process.step3Title'),
                desc: t('home.process.step3Desc'),
                icon: <BarChart3 className="h-7 w-7 text-white" />,
                color: "from-cyan-400 to-cyan-600",
                image: "/images/resolved-issue.svg"
              },
            ].map((step, i) => (
              <motion.div key={i} variants={fadeIn}>
                <Card className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border-0 h-full">
                  <div className="h-48 overflow-hidden">
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={400}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-50"></div>
                  </div>
                  <CardHeader className="flex flex-col items-center text-center">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-md -mt-12 border-4 border-white`}
                    >
                      {step.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* Process Flow Diagram - Desktop Only */}
          <div className="hidden lg:flex justify-center mt-20">
            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-indigo-500 transform -translate-y-1/2"></div>
              <div className="flex justify-between relative w-full max-w-4xl">
                {[
                  { label: t('home.process.flowLabels.submit'), icon: <Edit size={24} className="text-teal-600" /> },
                  { label: t('home.process.flowLabels.review'), icon: <Shield size={24} className="text-cyan-600" /> },
                  { label: t('home.process.flowLabels.assign'), icon: <Users size={24} className="text-blue-600" /> },
                  { label: t('home.process.flowLabels.resolve'), icon: <CheckCircle size={24} className="text-indigo-600" /> },
                  { label: t('home.process.flowLabels.verify'), icon: <BadgeCheck size={24} className="text-purple-600" /> }
                ].map((step, i) => (
                  <motion.div 
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { delay: 0.2 + (i * 0.1) } }
                    }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-white border-4 border-gray-100 shadow-md flex items-center justify-center mb-2 z-10">
                      {step.icon}
                    </div>
                    <p className="text-sm font-medium text-gray-700">{step.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid - Enhanced with More Visual Elements */}
      <motion.section
        className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-gradient-to-br from-teal-200 to-cyan-200 opacity-20 blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 opacity-20 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-indigo-50 text-indigo-700 rounded-full px-4 py-1.5 mb-4 font-medium text-sm">
              <Zap size={16} className="mr-2" />
              {t('home.features.sectionHeading')}
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('home.features.sectionTitle')}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('home.features.sectionDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MapPin className="h-8 w-8 text-white" />}
              title={t('home.features.geoLocation')}
            >
              {t('home.features.geoLocationDesc')}
            </FeatureCard>
            <FeatureCard
              icon={<Camera className="h-8 w-8 text-white" />}
              title={t('home.features.mediaUpload')}
            >
              {t('home.features.mediaUploadDesc')}
            </FeatureCard>
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-white" />}
              title={t('home.features.dashboard')}
            >
              {t('home.features.dashboardDesc')}
            </FeatureCard>
            <FeatureCard
              icon={<Mail className="h-8 w-8 text-white" />}
              title={t('home.features.notifications')}
            >
              {t('home.features.notificationsDesc')}
            </FeatureCard>
            <FeatureCard
              icon={<Users className="h-8 w-8 text-white" />}
              title={t('home.features.roleAccess')}
            >
              {t('home.features.roleAccessDesc')}
            </FeatureCard>
            <FeatureCard
              icon={<Share2 className="h-8 w-8 text-white" />}
              title={t('home.features.updates')}
            >
              {t('home.features.updatesDesc')}
            </FeatureCard>
          </div>
          
          {/* Feature highlight section */}
          <motion.div 
            variants={fadeIn}
            className="mt-24 bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-3xl overflow-hidden shadow-lg"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-10 flex flex-col justify-center">
                <div className="inline-flex items-center bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 mb-4 font-medium text-sm">
                  <Map size={16} className="mr-2" />
                  {t('home.features.highlight')}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {t('home.features.wardSystem')}
                </h3>
                <p className="text-gray-600 mb-8">
                  {t('home.features.wardSystemDesc')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">{t('home.features.tags.automatedRouting')}</div>
                  <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">{t('home.features.tags.smartAssignment')}</div>
                  <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">{t('home.features.tags.progressTracking')}</div>
                </div>
              </div>
              <div className="relative md:h-auto">
                <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-cyan-500 md:rounded-l-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/images/features/ward-map.jpg')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                  <div className="relative h-full p-8 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 max-w-md">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 rounded-lg bg-indigo-500 text-white">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{t('home.features.issueDetails.waterLeakage')}</h4>
                          <p className="text-sm text-gray-500">{t('home.features.issueDetails.assignedTo')}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('home.features.issueDetails.reported')}</span>
                          <span className="text-gray-900">{t('home.features.issueDetails.reportedTime')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('home.features.issueDetails.status')}</span>
                          <span className="text-amber-600 font-medium">{t('home.features.issueDetails.statusInProgress')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('home.features.issueDetails.location')}</span>
                          <span className="text-gray-900">{t('home.features.issueDetails.locationDetails')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced CTA Section */}
      <motion.section
        className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeIn}
      >
        {/* Enhanced Abstract Design Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-indigo-500 opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-cyan-400 opacity-10 blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-teal-400 opacity-10 blur-2xl"></div>
          <div className="absolute bottom-1/2 left-1/3 w-40 h-40 rounded-full bg-purple-400 opacity-10 blur-2xl"></div>
          
          {/* Grid overlay pattern */}
          <div className="absolute inset-0 bg-[url('/images/hero/grid-pattern.svg')] opacity-5"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-5 gap-12 items-center">
              <div className="md:col-span-3 text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  {t('home.cta.title')}
                </h2>
                <p className="text-lg md:text-xl mb-10 text-gray-300 max-w-xl mx-auto md:mx-0">
                  {t('home.cta.description')}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform group"
                  >
                    <Link href="/auth/register" className="flex items-center gap-2">
                      {t('home.cta.signUpButton')}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-gray-600 bg-orange-700 text-black hover:bg-white/10 transition-colors"
                  >
                    <Link href="/issues">{t('home.cta.exploreButton')}</Link>
                  </Button>
                </div>
              </div>
              <div className="md:col-span-2 relative hidden md:block">
                <div className="relative">
                  <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-lg rotate-12 opacity-70 blur-lg"></div>
                  <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg -rotate-12 opacity-70 blur-lg"></div>
                  
                  {/* Platform mockup */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-3xl shadow-2xl border border-gray-700">
                    <div className="bg-black rounded-2xl overflow-hidden border-4 border-gray-800">
                      <div className="relative bg-gray-900 px-4 py-2 flex justify-center">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-black rounded-b-xl"></div>
                        <span className="text-gray-400 text-xs">{t('home.cta.platformLabel')}</span>
                      </div>
                      <div className="py-4 px-3 space-y-4">
                        {/* Dummy content */}
                        <div className="bg-gray-800 h-12 rounded-lg flex items-center px-4">
                          <div className="w-6 h-6 rounded-full bg-teal-500 mr-3"></div>
                          <div className="flex-1">
                            <div className="h-2 w-3/4 bg-gray-600 rounded-full"></div>
                            <div className="h-2 w-1/2 bg-gray-700 rounded-full mt-1"></div>
                          </div>
                        </div>
                        <div className="bg-gray-800 h-24 rounded-lg p-3">
                          <div className="flex justify-between mb-2">
                            <div className="h-2 w-1/3 bg-gray-700 rounded-full"></div>
                            <div className="h-2 w-1/4 bg-teal-800 rounded-full"></div>
                          </div>
                          <div className="h-2 w-full bg-gray-700 rounded-full mb-2"></div>
                          <div className="h-2 w-5/6 bg-gray-700 rounded-full mb-2"></div>
                          <div className="h-2 w-3/4 bg-gray-700 rounded-full"></div>
                        </div>
                        <div className="bg-teal-600 h-10 rounded-lg flex items-center justify-center">
                          <div className="h-2 w-1/3 bg-white rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-800 h-16 rounded-lg"></div>
                          <div className="bg-gray-800 h-16 rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
