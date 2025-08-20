"use client";

import { motion } from "framer-motion";
import { AlertTriangle, BarChart3, Clock, Edit, Mail, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Animations
const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
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

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero */}
      <motion.section
        className="bg-gradient-to-br from-teal-600 via-cyan-600 to-indigo-600 text-white py-28"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <motion.div
            variants={fadeIn}
            className="md:w-1/2 text-center md:text-left"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              Empower Communities. <br /> Drive Change.
            </h1>
            <p className="text-lg md:text-xl mb-10 text-teal-100/90 max-w-xl mx-auto md:mx-0">
              Nayabato connects citizens with local officials. Report civic
              issues, track progress, and create lasting impact.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-white to-white/90 text-teal-600 font-semibold hover:scale-105 transition-transform shadow-lg"
              >
                <Link href="/issues/report">Report an Issue</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/80 text-white hover:bg-white hover:text-teal-600 font-semibold transition-colors"
              >
                <Link href="/issues">View Active Issues</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="md:w-1/2 flex justify-center">
            <Image
              src="/globe.svg"
              alt="Civic Engagement Platform"
              width={500}
              height={500}
              className="drop-shadow-2xl animate-float"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        className="py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              A Simple Path to Resolution
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Submit issues, track progress, and witness transparent resolutions
              in just a few steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              {
                title: "1. Submit Your Report",
                desc: "Easily file reports with photos and exact map locations.",
                icon: <AlertTriangle className="h-7 w-7 text-white" />,
                color: "from-teal-400 to-teal-600",
              },
              {
                title: "2. Track in Real-Time",
                desc: "Get live updates and notifications from officials.",
                icon: <Clock className="h-7 w-7 text-white" />,
                color: "from-amber-400 to-amber-600",
              },
              {
                title: "3. See the Resolution",
                desc: "Stay informed as local authorities take visible action.",
                icon: <BarChart3 className="h-7 w-7 text-white" />,
                color: "from-cyan-400 to-cyan-600",
              },
            ].map((step, i) => (
              <motion.div key={i} variants={fadeIn}>
                <Card className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border-0">
                  <CardHeader className="flex flex-col items-center text-center">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-md`}
                    >
                      {step.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        className="py-24 bg-gradient-to-b from-gray-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Platform Highlights
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need for effective civic engagement, built into one
              platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MapPin className="h-8 w-8 text-white" />}
              title="Geo-Location Tagging"
            >
              Pinpoint issues directly on the map for precision.
            </FeatureCard>
            <FeatureCard
              icon={<Image src="/file.svg" alt="Upload" width={28} height={28} />}
              title="Photo & Video Uploads"
            >
              Add media evidence for faster resolution.
            </FeatureCard>
            <FeatureCard
              icon={<Image src="/window.svg" alt="Dashboard" width={28} height={28} />}
              title="Official’s Dashboard"
            >
              A centralized hub for managing reported issues.
            </FeatureCard>
            <FeatureCard
              icon={<Mail className="h-8 w-8 text-white" />}
              title="Automated Notifications"
            >
              Stay updated with instant alerts and emails.
            </FeatureCard>
            <FeatureCard
              icon={<Users className="h-8 w-8 text-white" />}
              title="Role-Based Access"
            >
              Secure access tailored for citizens, officials, and admins.
            </FeatureCard>
            <FeatureCard
              icon={<Edit className="h-8 w-8 text-white" />}
              title="Public Updates"
            >
              Officials share progress and transparency with the community.
            </FeatureCard>
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-gray-300">
            Join Nayabato today and be part of a community that takes action.
            Your voice matters.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform"
            >
              <Link href="/auth/register">Sign Up Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-gray-600 text-gray-200 hover:bg-white hover:text-gray-900 transition-colors"
            >
              <Link href="/issues">Explore Issues</Link>
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
