import AdminLayout from '@/components/admin/layouts/AdminLayout';
import Items from "@/components/admin/Edits/MenusEdit/Items";

const Dashboard = () => {
    const menus = [
        { id: 1, name: 'Бидний тухай', typeMenu: 'Silver', order: 1, active: 1 },
        { id: 2, name: 'Хамтын ажиллагаа', typeMenu: 'Silver', order: 2, active: 1 },
        { id: 3, name: 'Мэдээ мэдээлэл', typeMenu: 'Silver', order: 3, active: 1 },
        { id: 4, name: 'Хууль, эрх зүй', typeMenu: 'Silver', order: 4, active: 1 },
        { id: 5, name: 'Ил тод', typeMenu: 'Silver', order: 5, active: 1 },
        { id: 6, name: 'Толгойн цэс', typeMenu: 'Silver', order: 6, active: 1 },
        { id: 7, name: 'Хөлны цэс', typeMenu: 'Silver', order: 6, active: 1 },
    ];
    return (
        <AdminLayout>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                {/* counts */}
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <main className='dark:bg-black h-full'>
                        <div className="flex flex-grow items-center justify-between px-4 py-5 shadow-2 md:px-5 2xl:px-10">
                            <div className="flex items-center justify-normal gap-2 2xsm:gap-4 lg:w-full lg:justify-between xl:w-auto xl:justify-normal">
                                <div className="nso_btn nso_btn_default margin_left_10 font-extrabold text-xl">
                                    Цэсний тохиргоо засах
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
                {/* menus edit */}
                <div className="flex flex-grow items-center justify-between px-4 py-5 md:px-5 2xl:px-10">
                    <Items menus={menus} />
                </div>
            </div >
        </AdminLayout >
    );
};

export default Dashboard;
