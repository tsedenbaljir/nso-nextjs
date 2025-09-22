import AdminLayout from '@/components/admin/layouts/AdminLayout';

import "../globals.scss";
import "primeflex/primeflex.css";
import 'primeicons/primeicons.css';

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export const metadata = {
  title: 'ҮСХ удирдах самбар',
  description: 'Мэдээллийг удирдах самбар',
}

export default function AdminLayoutWrapper({ children, params }) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  )
}
