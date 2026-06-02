"use client";
import { use } from "react";
import WorkspaceForm from '../../WorkspaceForm';

export default function EditWorkspace(props) {
    const params = use(props.params);

    const {
        id,
        lng
    } = params;

    return (
            <WorkspaceForm id={id} lng={lng} />
    );
} 