import { ShieldCheckIcon, CogIcon, ShareIcon, LockClosedIcon, UserCircleIcon, ArrowPathIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

const policies = [
  {
    title: "Information We Collect",
    description: "We may collect personal information such as your name, email, and contact details when you register. We also gather data from your issue reports, including location, descriptions, and photos. Usage data like your IP address and browser type is collected to improve our service.",
    icon: ShieldCheckIcon,
  },
  {
    title: "How We Use Your Information",
    description: "Your information is used to provide and maintain the Service, notify you about changes, and allow you to participate in interactive features. We also use it for customer support, to improve the Service, monitor usage, and address technical issues.",
    icon: CogIcon,
  },
  {
    title: "Information Sharing and Disclosure",
    description: "Issue reports are shared with municipal authorities for resolution. We may disclose your information with your consent or for legal reasons, such as to comply with a legal obligation or protect our rights.",
    icon: ShareIcon,
  },
  {
    title: "Data Security",
    description: "We strive to use commercially acceptable means to protect your personal data, but no method of transmission over the Internet is 100% secure. We cannot guarantee the absolute security of your information.",
    icon: LockClosedIcon,
  },
  {
    title: "Your Data Protection Rights",
    description: "You may have the right to access, update, or delete your personal information. If you wish to exercise these rights, please contact us through our support channels.",
    icon: UserCircleIcon,
  },
  {
    title: "Data Retention",
    description: "We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.",
    icon: ArrowPathIcon,
  },
  {
    title: "Contact Us",
    description: "If you have any questions about this Privacy Policy or our data practices, please contact us through our available support channels.",
    icon: EnvelopeIcon,
  },
];

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Privacy Policy
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
              Your privacy is important to us. Here's how we collect, use, and protect your information on the Nayabato platform.
            </p>
            <div className="mt-8 text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy, index) => (
            <div 
              key={policy.title} 
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 p-8"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white shadow-lg">
                  <policy.icon className="w-6 h-6" />
                </div>
                <div className="ml-4 text-sm font-medium text-green-600">
                  Section {index + 1}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                {policy.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {policy.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Commitment Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-6">
              <LockClosedIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-4">
              Your Privacy is Our Priority
            </h3>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              We are committed to protecting your personal information and being transparent about how we use it. 
              Your trust is essential to our mission of improving communities through civic engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/about" 
                className="inline-flex items-center px-6 py-3 border border-white border-opacity-30 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
              >
                Learn More About Us
              </a>
              <a 
                href="/" 
                className="inline-flex items-center px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Questions about your Privacy?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              If you have any questions or concerns about this Privacy Policy or how we handle your data, we're here to help.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
