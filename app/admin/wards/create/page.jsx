import AdvancedWardCreation from '@/components/admin/AdvancedWardCreation';

export const metadata = {
  title: 'Advanced Ward Creation - NayaBato Admin',
  description: 'Create wards with intelligent geospatial optimization and coverage analysis',
};

export default function CreateWardPage() {
  return (
    <div className="container mx-auto py-6">
      <AdvancedWardCreation />
    </div>
  );
}
