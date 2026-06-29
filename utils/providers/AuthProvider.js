"use client";

import { SessionProvider } from "next-auth/react";

const AuthProvider = ({ children }) => {
    return <SessionProvider refetchInterval={60}>{children}</SessionProvider>;
}

export default AuthProvider;