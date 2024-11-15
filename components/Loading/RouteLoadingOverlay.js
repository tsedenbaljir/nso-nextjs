"use client"
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LoadingContextData } from '@/utils/contexts/LoadingContext';
import { Spin } from 'antd';

export default function RouteLoadingOverlay() {
    const { routeLoading, setRouteLoading } = LoadingContextData();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleStart = () => setRouteLoading(true);
        const handleEnd = () => setRouteLoading(false);

        handleEnd(); // Reset on initial load

        window.addEventListener('beforeunload', handleStart);
        window.addEventListener('load', handleEnd);

        return () => {
            window.removeEventListener('beforeunload', handleStart);
            window.removeEventListener('load', handleEnd);
        };
    }, [pathname, searchParams, setRouteLoading]);

    if (!routeLoading) return null;

    return (
        <div className="route-loading-overlay">
            <div className="route-loading-content">
                <Spin size="large" />
                <div className="mt-4">Уншиж байна...</div>
            </div>
            <style jsx>{`
                .route-loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                }
                .route-loading-content {
                    text-align: center;
                }
            `}</style>
        </div>
    );
} 