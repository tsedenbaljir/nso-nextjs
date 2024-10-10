import { Inter } from "next/font/google";
import "./globals.scss";
import "primeflex/primeflex.css";
import 'primeicons/primeicons.css';
import Providers from "@/utils/providers/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Үндэсний статистикийн хороо",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
