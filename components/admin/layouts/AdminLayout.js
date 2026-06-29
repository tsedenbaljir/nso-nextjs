'use client';
import React, { useEffect } from 'react';
import { Spin } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { message } from 'antd';
import Sidebar from '@/components/admin/sidebar/page';
import Header from '@/components/admin/header/index';

const AdminLayout = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const lng = pathname?.split('/')[1] || 'mn';
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push(`/${lng}/login`);
        }
    }, [session, status, router, lng]);

    useEffect(() => {
        if (status === 'loading' || !session?.expires) return;

        const logoutExpired = () => {
            message.warning('Нэвтрэх хугацаа дууссан. Дахин нэвтэрнэ үү.');
            signOut({ redirect: false }).then(() => router.push(`/${lng}/login`));
        };

        const remaining = new Date(session.expires).getTime() - Date.now();
        if (remaining <= 0) {
            logoutExpired();
            return;
        }

        const timer = setTimeout(logoutExpired, remaining);
        return () => clearTimeout(timer);
    }, [session?.expires, status, router, lng]);

    // Show loading state while checking authentication
    if (status === 'loading') {
        return <div className='nso_about_us'>
            <div className='flex items-center justify-center min-h-screen'>
                <div className='nso_container text-center items-center justify-center'>
                    <div className="mt-4 text-lg">Уншиж байна...</div>
                    <Spin size="large" />
                    </div>
            </div>
        </div>
    }

    // Only render the layout if authenticated
    if (!session) {
        return null;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar user={session.user} userstatus={status} />
            {/* Main Content */}
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                <Header />
                <main className='dark:bg-black h-full'>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
