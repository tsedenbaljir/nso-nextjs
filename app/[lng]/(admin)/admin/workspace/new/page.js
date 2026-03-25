"use client"
import WorkspaceForm from '../WorkspaceForm';

export default function NewWorkspace({ params: { lng } }) {
    return (
        <WorkspaceForm lng={lng} />
    );
} 