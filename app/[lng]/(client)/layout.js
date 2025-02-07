import { Inter } from "next/font/google";
import "../globals.scss";
import "primeflex/primeflex.css";
import 'primeicons/primeicons.css';
import Layout from '@/components/baseLayout';

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import Script from "next/script";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Үндэсний статистикийн хороо",
  description: "",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  }
};

export default function RootLayout({ children, params: { lng } }) {
  return (
    <html lang="en">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-9DGLNDV1MB"></Script>
        <Script async src="/egune-chat.js"></Script>
        <Script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9DGLNDV1MB');
          `}
        </Script>
        <Script src="https://www.google.com/recaptcha/api.js?render=explicit&onload=loadCaptcha" async defer></Script>
      </head>
      <body className={inter.className}>
          <Layout lng={lng}>
            {children}
          </Layout>
      </body>
    </html>
  );
}
