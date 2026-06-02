"use client";
import { use } from "react";
import WorkspaceForm from '../WorkspaceForm';

export default function NewWorkspace(props) {
    const params = use(props.params);

    const {
        lng
    } = params;

    return (
        <WorkspaceForm lng={lng} />
    );
} 