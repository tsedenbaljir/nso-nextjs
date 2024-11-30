"use client"
import WorkspaceForm from '../WorkspaceForm';
import AdminLayout from '@/components/admin/layouts/AdminLayout'

export default function NewWorkspace({ params: { lng } }) {
    return (
        <AdminLayout lng={lng}>
            <WorkspaceForm lng={lng} />
        </AdminLayout>
    );
} 