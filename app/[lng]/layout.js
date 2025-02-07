import "./globals.scss";
import Providers from "@/utils/providers/providers";

export default function RootLayout({ children }) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}
