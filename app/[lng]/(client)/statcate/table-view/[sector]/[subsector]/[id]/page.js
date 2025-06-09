"use client";
import { useEffect, useState } from "react";
import VariablesPanel from '@/components/table-view/VariablePanel';
import Loading from '@/components/Loader';

export default function TableView({ params }) {
    const lng = params.lng;
    const sector = params.sector;
    const subsector = params.subsector;
    const id = params.id;

    const [title, setTitle] = useState('');
    const [variables, setVariables] = useState([]);

    useEffect(() => {
        async function getData() {
            const res = await fetch(`/api/table-view?lng=${lng}&sector=${sector}&subsector=${subsector}&id=${id}`);
            if (!res.ok) {
                throw new Error('Failed to fetch data');
            }
            const json = await res.json();
            setTitle(json.title);
            setVariables(json.variables);
            console.log(json.variables);
        }
        getData();
    }, [params]);

    return (
        <div className="nso_container">
            <div className="w-full my-5">
                <h1 className='text-2xl font-medium mb-6'>{title}</h1>
                {variables.length > 0 ? (
                    <VariablesPanel variables={variables} url={`/api/table-view?lng=${lng}&sector=${sector}&subsector=${subsector}&id=${id}`} />
                ) : <div className='flex items-center h-full'>
                    <Loading />
                </div>}
            </div>
        </div>
    );
}
