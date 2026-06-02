"use client";
import { use } from "react";
import WorkspaceForm from '../WorkspaceForm';

export default function NewWorkspace(props) {
    const {
        lng
    } = use(props.params);

    return (
        <WorkspaceForm lng={lng} />
    );
} 