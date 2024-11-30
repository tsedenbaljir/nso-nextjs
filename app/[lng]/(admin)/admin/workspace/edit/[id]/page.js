"use client"
import WorkspaceForm from '../../WorkspaceForm';
import AdminLayout from '@/components/admin/layouts/AdminLayout'

export default function EditWorkspace({ params: { id, lng } }) {
    return (
        <AdminLayout>
            <WorkspaceForm id={id} lng={lng} />
        </AdminLayout>
    );
} 