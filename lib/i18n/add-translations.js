import { useLanguage } from '@/lib/i18n/language-context';

// Add additional translations related to issue deletion
export function addIssueDeleteTranslations() {
  const { t } = useLanguage();
  
  // Get current translations
  const translations = t._translations || {};
  
  // Add new translations for English
  if (translations.en && translations.en.issues) {
    translations.en.issues = {
      ...translations.en.issues,
      deleteIssue: "Delete Issue",
      deleteConfirmation: "Are you sure you want to delete this issue? This action cannot be undone.",
      deleteOnlyResolvedNote: "As an official, you can only delete resolved issues.",
      deleteSuccess: "Issue deleted successfully",
      issueRemoved: "Issue was successfully removed",
      manageDepartmentIssues: "Manage Department Issues",
      fetchError: "Failed to load issues",
      statusUpdated: "Status updated to {status}",
      markInProgress: "Mark as In Progress",
      markResolved: "Mark as Resolved",
      markRejected: "Mark as Rejected",
    };
  }
  
  // Add new translations for Nepali
  if (translations.ne && translations.ne.issues) {
    translations.ne.issues = {
      ...translations.ne.issues,
      deleteIssue: "समस्या मेट्नुहोस्",
      deleteConfirmation: "के तपाईं यो समस्या मेट्न निश्चित हुनुहुन्छ? यो कार्य रद्द गर्न सकिँदैन।",
      deleteOnlyResolvedNote: "एक अधिकारीको रूपमा, तपाईं केवल समाधान गरिएका समस्याहरू मेट्न सक्नुहुन्छ।",
      deleteSuccess: "समस्या सफलतापूर्वक मेटियो",
      issueRemoved: "समस्या सफलतापूर्वक हटाइयो",
      manageDepartmentIssues: "विभाग समस्याहरू व्यवस्थापन गर्नुहोस्",
      fetchError: "समस्याहरू लोड गर्न असफल भयो",
      statusUpdated: "स्थिति {status} मा अपडेट गरियो",
      markInProgress: "प्रगतिमा चिन्ह लगाउनुहोस्",
      markResolved: "समाधान भएको चिन्ह लगाउनुहोस्",
      markRejected: "अस्वीकृत चिन्ह लगाउनुहोस्",
    };
  }
}

export default addIssueDeleteTranslations;
