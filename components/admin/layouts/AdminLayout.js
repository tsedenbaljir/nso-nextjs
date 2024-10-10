import React from 'react';
import Sidebar from '@/components/admin/sidebar/page';
import Header from '@/components/admin/header/index';

const AdminLayout = ({ children }) => {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />
            {/* Main Content */}
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                <Header />
                <main className='dark:bg-black h-full'>
                    {/* <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10"> */}
                    {children}
                    {/* </div> */}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
