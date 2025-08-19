import "../globals.scss";
import "primeflex/primeflex.css";
import 'primeicons/primeicons.css';
import { Inter } from "next/font/google";
import Layout from '@/components/baseLayout';
// import { App } from '@/components/chatBOT/n8nChat';

import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";

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
        {/* <Script type="application/javascript">
          {`
            (function(w,d,s,o,f,js,fjs){w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments);};(js=d.createElement(s)),(fjs=d.getElementsByTagName(s)[0]);js.id=o;js.src=f;js.async=1;js.referrerPolicy = "origin";fjs.parentNode.insertBefore(js,fjs);})(window,document,"script","copilot","https://script.copilot.live/v1/copilot.min.js?tkn=cat-2g9ri1xs");
            copilot("init",{});
          `}
        </Script> */}
        <Script src="https://www.google.com/recaptcha/api.js?render=explicit&onload=loadCaptcha" async defer></Script>
      </head>
      <body className={inter.className}>
        <Layout lng={lng}>
          {children}
        </Layout>
        {/* <App /> */}
      </body>
    </html>
  );
}
