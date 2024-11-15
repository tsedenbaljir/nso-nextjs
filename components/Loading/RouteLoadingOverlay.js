"use client"
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LoadingContextData } from '@/utils/contexts/LoadingContext';
import Loader from '../Loader';

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

    return <Loader />;
} 