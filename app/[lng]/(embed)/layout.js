import "../globals.scss";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";

export const metadata = {
  robots: { index: false, follow: true },
};

export default function EmbedLayout({ children }) {
  return (
    <>
      <style>{`
        #egune-chat-root { display: none !important; }
        body { margin: 0; background: #f5f8fc; }
      `}</style>
      <div className="nso-embed min-w-0 max-w-full overflow-x-hidden">
        {children}
      </div>
    </>
  );
}
