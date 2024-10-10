import AdminLayout from '@/components/admin/layouts/AdminLayout';
import HeadItems from "@/components/admin/menus/MenuItems/HeadItems";
import Items from "@/components/admin/menus/MenuItems/Items";

const Dashboard = () => {
    const menus = [
        { id: 1, name: 'Бидний тухай', typeMenu: 'Main', order: 1, active: 1 },
        { id: 2, name: 'Хамтын ажиллагаа', typeMenu: 'Main', order: 2, active: 1 },
        { id: 3, name: 'Мэдээ мэдээлэл', typeMenu: 'Main', order: 3, active: 1 },
        { id: 4, name: 'Хууль, эрх зүй', typeMenu: 'Main', order: 4, active: 1 },
        { id: 5, name: 'Ил тод', typeMenu: 'Main', order: 5, active: 1 },
        { id: 6, name: 'Толгойн цэс', typeMenu: 'Head', order: 6, active: 1 },
        { id: 7, name: 'Хөлны цэс', typeMenu: 'Silver', order: 6, active: 1 },
    ];
    return (
        <AdminLayout>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                {/* counts */}
                <HeadItems />
                {/* menus */}
                <Items menus={menus} />
            </div >
        </AdminLayout >
    );
};

export default Dashboard;
