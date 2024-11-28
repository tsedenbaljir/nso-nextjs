import AdminLayout from '@/components/admin/layouts/AdminLayout';
import DataStatsOne from "@/components/DataStats/DataStatsOne";

const Dashboard = () => {
    return (
        <AdminLayout>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                <DataStatsOne />
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
