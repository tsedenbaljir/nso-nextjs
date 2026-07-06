import "../globals.scss";
import "primeflex/primeflex.css";
import 'primeicons/primeicons.css';
import Layout from '@/components/baseLayout';
// import { App } from '@/components/chatBOT/n8nChat';

import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";

export const metadata = {
  title: "Үндэсний статистикийн хороо",
  description: "",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  }
};

export default async function ClientLayout(props) {
  const params = await props.params;

  const {
    lng
  } = params;

  const {
    children
  } = props;

  return (
    <Layout lng={lng}>
      {children}
    </Layout>
  );
}
