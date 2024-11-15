"use client"
import { createContext, useState, useContext } from 'react';
import Loader from '@/components/Loader';

const ContextData = createContext(undefined);

export function LoadingContextData() {
    const context = useContext(ContextData);

    if (!context) {
        throw new Error('LoadingContextData must be used within a LoadingContext');
    }
    return context;
}

export const LoadingContext = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [routeLoading, setRouteLoading] = useState(false);

    return (
        <ContextData.Provider value={{ loading, setLoading, routeLoading, setRouteLoading }}>
            {children}
            {loading && <Loader />}
        </ContextData.Provider>
    );
};
