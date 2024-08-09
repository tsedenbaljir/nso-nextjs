"use client"
import { createContext, useState, useContext, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ContextData = createContext(undefined);

export function UserContextData() {
    const context = useContext(ContextData);

    if (!context) {
        throw new Error('useSidebarContext must be used within a SidebarProvider');
    }
    return context;
}

export const UserProvider = ({ children }) => {
    const [userContext, setUsersContext] = useState({});
    const router = useRouter();
    const { data: session, status } = useSession();
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else {
            if (session) {
                setUsersContext(session.user.name)
            }
        }
    }, [status]);

    return (
        <ContextData.Provider value={{ userContext }}>
            {children}
        </ContextData.Provider>
    );
};
