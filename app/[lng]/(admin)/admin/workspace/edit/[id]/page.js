"use client"
import WorkspaceForm from '../../WorkspaceForm';

export default function EditWorkspace({ params: { id, lng } }) {
    return (
            <WorkspaceForm id={id} lng={lng} />
    );
} 