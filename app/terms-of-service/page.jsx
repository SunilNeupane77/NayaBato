import { DocumentTextIcon, UserGroupIcon, ShieldCheckIcon, ExclamationTriangleIcon, CogIcon, ArrowPathIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

const terms = [
  {
    title: "Acceptance of Terms",
    description: "By using Nayabato, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not use the Service.",
    icon: DocumentTextIcon,
  },
  {
    title: "Description of Service",
    description: "Nayabato is a platform for reporting and tracking public infrastructure issues. It allows users to submit reports, view their status, and receive updates.",
    icon: CogIcon,
  },
  {
    title: "User Conduct",
    description: "You agree to use the Service lawfully and not to submit false information, post objectionable content, or harass others. You are responsible for the accuracy of your reports.",
    icon: UserGroupIcon,
  },
  {
    title: "Intellectual Property",
    description: "The Service and its content are the exclusive property of the Nayabato platform and are protected by copyright and other laws.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Disclaimer of Warranties",
    description: 'The Service is provided "as is" without warranties of any kind. We do not guarantee that the Service will be error-free or uninterrupted.',
    icon: ExclamationTriangleIcon,
  },
  {
    title: "Limitation of Liability",
    description: "Nayabato and its affiliates are not liable for any indirect or consequential damages resulting from your use of the Service.",
    icon: ExclamationTriangleIcon,
  },
  {
    title: "Governing Law",
    description: "These Terms are governed by the laws of the jurisdiction where the Service is operated.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Changes to Terms",
    description: "We may modify these Terms at any time. We will provide notice of material changes.",
    icon: ArrowPathIcon,
  },
  {
    title: "Contact Us",
    description: "If you have any questions about these Terms, please contact us through our support channels.",
    icon: EnvelopeIcon,
  },
];

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <DocumentTextIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl lg:text-6xl">
              Terms of Service
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Please read our terms carefully before using our service. These terms govern your use of the Nayabato platform.
            </p>
            <div className="mt-8 text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Terms Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {terms.map((term, index) => (
            <div 
              key={term.title} 
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/20 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 p-8"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
                  <term.icon className="w-6 h-6" />
                </div>
                <div className="ml-4 text-sm font-medium text-blue-600">
                  Section {index + 1}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                {term.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {term.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Questions about our Terms?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              If you have any questions or concerns about these Terms of Service, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/about" 
                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
              >
                Learn More About Us
              </a>
              <a 
                href="/" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
