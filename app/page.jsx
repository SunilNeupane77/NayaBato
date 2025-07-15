'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, BarChart3, Clock, MapPin, Mail, Users, Edit } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Animation variants for Framer Motion
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Reusable FeatureCard component
const FeatureCard = ({ icon, title, children }) => (
  <motion.div variants={fadeIn} className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
    <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </motion.div>
);

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-gray-50">
      {/* Hero Section */}
      <motion.section 
        className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white py-24"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <motion.div variants={fadeIn} className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
              Empowering Communities, <br /> One Report at a Time.
            </h1>
            <p className="text-xl mb-8 text-teal-100 max-w-xl mx-auto md:mx-0">
              Nayabato is your direct line to local officials. Report civic issues, track their progress, and build a better neighborhood, together.
            </p>
            <motion.div variants={fadeIn} className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Button asChild size="lg" className="bg-white text-teal-600 hover:bg-teal-50 shadow-lg transform hover:scale-105 transition-transform">
                <Link href="/issues/report">Report an Issue</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-teal-600 transition-colors">
                <Link href="/issues">View Active Issues</Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div variants={fadeIn} className="md:w-1/2 flex justify-center">
            <Image 
              src="/globe.svg" 
              alt="Civic Engagement Platform" 
              width={450} 
              height={450} 
              className="max-w-full h-auto"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        className="py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">A Simple Path to Resolution</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Our streamlined process makes it easy for you to make a difference. See how your reports turn into real-world solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <motion.div variants={fadeIn}>
              <Card className="border-t-4 border-t-teal-500 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-7 w-7 text-teal-600" />
                  </div>
                  <CardTitle className="text-2xl">1. Submit Your Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Quickly report issues using our intuitive form. Add photos and pinpoint the location on a map for accuracy.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card className="border-t-4 border-t-amber-500 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <Clock className="h-7 w-7 text-amber-600" />
                  </div>
                  <CardTitle className="text-2xl">2. Track in Real-Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Stay informed with live status updates and notifications as your issue is reviewed and addressed by officials.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card className="border-t-4 border-t-cyan-500 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-cyan-100 flex items-center justify-center mb-4">
                    <BarChart3 className="h-7 w-7 text-cyan-600" />
                  </div>
                  <CardTitle className="text-2xl">3. See the Resolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Local authorities take action. Once resolved, you get notified, ensuring transparency and accountability.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Features Section */}
      <motion.section 
        className="py-20 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Platform Highlights</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Nayabato is packed with features designed for seamless civic engagement and effective problem-solving.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={<MapPin className="h-8 w-8 text-teal-600" />} title="Geo-Location Tagging">
              Pinpoint the exact location of an issue on our interactive map for a faster response.
            </FeatureCard>
            <FeatureCard icon={<Image src="/file.svg" alt="Media Uploads" width={32} height={32} />} title="Photo & Video Uploads">
              A picture is worth a thousand words. Attach media to provide clear evidence of the problem.
            </FeatureCard>
            <FeatureCard icon={<Image src="/window.svg" alt="Official Dashboard" width={32} height={32} />} title="Official's Dashboard">
              A powerful, centralized dashboard for officials to manage, prioritize, and track all reported issues.
            </FeatureCard>
            <FeatureCard icon={<Mail className="h-8 w-8 text-teal-600" />} title="Automated Notifications">
              Receive email updates automatically as your reported issue moves through the resolution pipeline.
            </FeatureCard>
            <FeatureCard icon={<Users className="h-8 w-8 text-teal-600" />} title="Role-Based Access Control">
              Secure accounts with distinct roles for citizens, officials, and administrators.
            </FeatureCard>
            <FeatureCard icon={<Edit className="h-8 w-8 text-teal-600" />} title="Public Status Updates">
              Officials can post public notes and status changes, keeping the entire community informed.
            </FeatureCard>
          </div>
        </div>
      </motion.section>
      
      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-gray-800 to-gray-900 text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto text-gray-300">
            Create an account today to join your neighbors in building a stronger, more responsive community. Your voice matters.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-teal-500 text-white hover:bg-teal-600 shadow-lg transform hover:scale-105 transition-transform">
              <Link href="/auth/register">Sign Up Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-teal-500 text-teal-500 hover:bg-black hover:text-white transition-colors">
              <Link href="/issues">Explore Issues</Link>
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}