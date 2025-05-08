"use client";
import { useEffect, useState } from "react";
import VariablesPanel from '../../../VariablePanel';
import Loading from '@/components/Loader';

export default function TableView({ params }) {
    const lng = params.lng;
    const sector = params.sector;
    const subsector = params.subsector;
    const id = params.id;

    const baseAPI = 'https://data.1212.mn/api/v1';
    const [title, setTitle] = useState('');
    const [variables, setVariables] = useState([]);

    useEffect(() => {
        async function getData() {
            const res = await fetch(`${baseAPI}/${lng}/NSO/${decodeURIComponent(sector)}/${decodeURIComponent(subsector)}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': 'a79fb6ab-5953-4c46-a240-a20c2af9150a',
                },
            });
            const json = await res.json();
            console.log("json===>", json);
            setTitle(json.title);
            setVariables(json.variables);
        }
        getData();
    }, [params]);

    return (
        <div className="nso_container statisctic_body">
            <div className="w-full my-5">
                <h1 className='text-2xl font-bold mb-6'>{title}</h1>
                {variables.length > 0 ? (
                    <VariablesPanel variables={variables} url={`${baseAPI}/${lng}/NSO/${decodeURIComponent(sector)}/${decodeURIComponent(subsector)}/${id}`} />
                ) : <div className='flex justify-center items-center h-full'>
                    <Loading />
                </div>}
            </div>
        </div>
    );
}
