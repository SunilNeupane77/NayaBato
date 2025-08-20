import { ShieldCheckIcon, CogIcon, ShareIcon, LockClosedIcon, UserCircleIcon, ArrowPathIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

const policies = [
  {
    title: "Information We Collect",
    description: "We may collect personal information such as your name, email, and contact details when you register. We also gather data from your issue reports, including location, descriptions, and photos. Usage data like your IP address and browser type is collected to improve our service. We use cookies to track activity and enhance your user experience.",
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
    description: "You may have the right to access, update, or delete your personal information. If you wish to exercise these rights, please contact us.",
    icon: UserCircleIcon,
  },
  {
    title: "Changes to This Privacy Policy",
    description: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.",
    icon: ArrowPathIcon,
  },
  {
    title: "Contact Us",
    description: "If you have any questions about this Privacy Policy, please contact us at privacy@nayabato.com.",
    icon: EnvelopeIcon,
  },
];

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-gray-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Your privacy is important to us. Here's how we handle your information.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => (
            <div key={policy.title} className="bg-white shadow-lg rounded-lg p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <policy.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-800">{policy.title}</h2>
              <p className="mt-2 text-gray-600">{policy.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;