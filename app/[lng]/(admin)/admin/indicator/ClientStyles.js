'use client';
import { useEffect } from 'react';

export default function ClientStyles() {
  useEffect(() => {
    require("primereact/resources/themes/lara-light-indigo/theme.css");
    require("primereact/resources/primereact.min.css");
    require("primeicons/primeicons.css");
  }, []);

  return null;
} 