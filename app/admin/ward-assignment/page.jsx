import ProfessionalWardAssignment from '@/components/admin/ProfessionalWardAssignment';

export const metadata = {
  title: 'Professional Ward Assignment - NayaBato Admin',
  description: 'Advanced geospatial analysis and automated ward assignment using Haversine algorithm',
};

export default function WardAssignmentPage() {
  return (
    <div className="container mx-auto py-6">
      <ProfessionalWardAssignment />
    </div>
  );
}
