import AdminLayout from '@/components/admin/AdminLayout';
import KPIBar from '@/components/admin/KPIBar';
import ApprovalQueue from '@/components/admin/ApprovalQueue';
import TaskList from '@/components/admin/TaskList';

export default function AdminHomePage() {
  return (
    <AdminLayout>
      <KPIBar />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ApprovalQueue />
        <TaskList />
      </div>
    </AdminLayout>
  );
}
