import { Inter } from "next/font/google";
import "./globals.scss";
import "primeflex/primeflex.css";
import 'primeicons/primeicons.css';
import Providers from "@/utils/providers/providers";
import Script from "next/script";
import RouteLoadingOverlay from '@/components/loading/RouteLoadingOverlay';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Үндэсний статистикийн хороо",
  description: "",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-9DGLNDV1MB"></Script>
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
        <Providers>
          <RouteLoadingOverlay />
          {children}
        </Providers>
      </body>
    </html>
  );
}
