import AdminLayout from '@/components/admin/layouts/AdminLayout';
import DataStatsOne from "@/components/DataStats/DataStatsOne";

const Dashboard = () => {
    return (
        <AdminLayout>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                <DataStatsOne />
            </div>
            {/* <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
                <div className="col-span-12 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
                    <div className="mb-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
                                Payments Overview
                            </h4>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <p className="font-medium uppercase text-dark dark:text-dark-6">
                                Short by:
                            </p>
                            <DefaultSelectOption options={["Monthly", "Yearly"]} />
                        </div>
                    </div>
                </div>
            </div> */}
        </AdminLayout>
    );
};

export default Dashboard;
