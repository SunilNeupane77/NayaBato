import { Cpu, Users } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">About Nayabato</h1>
        <p className="text-lg text-gray-600">
          Connecting citizens and government for better communities
        </p>
      </div>
      
      <div className="prose prose-blue max-w-none mb-16">
        <p className="lead text-lg">
          Nayabato is a civic engagement platform designed to improve communication between citizens and local government. 
          By providing an efficient way to report and track public service issues, we aim to create more responsive and 
          transparent local governance.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4">Our Mission</h2>
        <p>
          Our mission is to empower citizens to actively participate in improving their communities by providing them 
          with the tools to easily report issues, track progress, and collaborate with local officials.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4">How We Help</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold">For Citizens</h3>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Easy issue reporting with photos and location</li>
              <li>Real-time status updates on reported problems</li>
              <li>Transparent communication with local officials</li>
              <li>Track community improvement progress</li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Cpu className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold">For Government</h3>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Centralized issue management system</li>
              <li>Data-driven insights for resource allocation</li>
              <li>Improved citizen communication channels</li>
              <li>Enhanced accountability and transparency</li>
            </ul>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-12 mb-4">Our Technology</h2>
        <p>
          Nayabato is built using modern web technologies to ensure a responsive, reliable and secure experience:
        </p>
        <ul className="list-disc list-inside my-4 text-gray-700 space-y-2">
          <li>Next.js for a fast, server-rendered application</li>
          <li>MongoDB for flexible and scalable data storage</li>
          <li>Cloudinary for efficient media management</li>
          <li>Leaflet maps for precise location reporting</li>
          <li>Secure authentication and role-based access control</li>
        </ul>

        <h2 className="text-2xl font-bold mt-12 mb-4">Get Involved</h2>
        <p>
          There are many ways to get involved with the Nayabato project:
        </p>
        <div className="flex flex-wrap gap-4 my-8">
          <Button asChild>
            <Link href="/auth/register">Create an Account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/issues/report">Report an Issue</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="mailto:contact@nayabato.com">Contact Us</a>
          </Button>
        </div>
      </div>
      
      <Separator className="my-12" />
      
      <div className="text-center">
        <h3 className="text-xl font-bold mb-4">Ready to improve your community?</h3>
        <p className="text-gray-600 mb-8">
          Join thousands of citizens making a difference every day.
        </p>
        <Button asChild size="lg">
          <Link href="/auth/register">Get Started Now</Link>
        </Button>
      </div>
    </div>
  );
}
