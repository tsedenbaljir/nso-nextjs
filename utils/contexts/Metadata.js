'use client';
import { createContext, useContext, useState } from 'react';

const MetadataContext = createContext();

export function MetadataProvider({ children }) {
    const [metadata, setMetadata] = useState([]);

    return (
        <MetadataContext.Provider value={{ metadata, setMetadata }}>
            {children}
        </MetadataContext.Provider>
    );
}

export const useMetadata = () => useContext(MetadataContext);