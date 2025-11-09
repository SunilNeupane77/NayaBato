import AdvancedWardCreation from '@/components/admin/AdvancedWardCreation';
import BulkWardCreation from '@/components/admin/BulkWardCreation';
import WardManagement from '@/components/admin/WardManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata = {
  title: 'Ward Management - NayaBato Admin',
  description: 'Advanced ward creation and management with geospatial optimization',
};

export default function WardManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Ward Management</h1>
        <p className="text-muted-foreground">
          Create and manage wards with professional geospatial optimization
        </p>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">Manage Wards</TabsTrigger>
          <TabsTrigger value="create">Create Ward</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Create</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <WardManagement />
        </TabsContent>

        <TabsContent value="create">
          <AdvancedWardCreation />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkWardCreation />
        </TabsContent>
      </Tabs>
    </div>
  );
}
