"use client";
import { use } from "react";
import WorkspaceForm from '../../WorkspaceForm';

export default function EditWorkspace(props) {
    const {
        id,
        lng
    } = use(props.params);

    return (
            <WorkspaceForm id={id} lng={lng} />
    );
} 