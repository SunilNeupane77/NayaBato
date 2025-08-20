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
    description: "The Service and its content are the exclusive property of the Nayabato team and are protected by copyright and other laws.",
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
    description: "If you have any questions about these Terms, please contact us at support@nayabato.com.",
    icon: EnvelopeIcon,
  },
];

const TermsOfServicePage = () => {
  return (
    <div className="bg-gray-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Please read our terms carefully before using our service.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {terms.map((term) => (
            <div key={term.title} className="bg-white shadow-lg rounded-lg p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <term.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-800">{term.title}</h2>
              <p className="mt-2 text-gray-600">{term.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;