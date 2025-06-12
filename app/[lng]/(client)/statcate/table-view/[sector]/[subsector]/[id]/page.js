"use client";
import { useEffect, useState } from "react";
import VariablesPanel from '@/components/table-view/VariablePanel';
import Loading from '@/components/Loader';

export default function TableView({ params }) {
    const lng = params.lng;
    const sector = params.sector;
    const subsector = params.subsector;
    const id = params.id;

    const [metadataUrl, setMetadata] = useState('');
    const [title, setTitle] = useState('');
    const [variables, setVariables] = useState([]);

    useEffect(() => {
        async function getData() {
            try {
                // Fetch the table data
                const res = await fetch(`/api/table-view?lng=${lng}&sector=${sector}&subsector=${subsector}&id=${id}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }
                const json = await res.json();
                setTitle(json.title);
                setVariables(json.variables);
            } catch (error) {
                console.log("error getdatas", error);
            }
        }
        getData();
        async function getMetadata() {
            try {
                // Fetch the URL
                const resMetadata = await fetch(`/api/table-view/metadata?lng=${lng}&sector=${sector}&subsector=${subsector}&id=${id}`);

                if (!resMetadata.ok) {
                    throw new Error('Failed to fetch metadata');
                }

                const data = await resMetadata.json();
                if (data.error) {
                    console.error('Error fetching metadata:', data.error);
                } else if (data.content) {
                    setMetadata(data.content);
                } else {
                    console.log('No metadata content found in response');
                }
            } catch (error) {
                console.error('Error fetching or parsing data:', error);
            }
        }
        getMetadata()
    }, [params]);

    return (
        <div className="nso_container">
            <div className="w-full my-5">
                <h1 className='text-2xl font-medium mb-6'>{title}</h1>
                {variables.length > 0 ? (
                    <VariablesPanel variables={variables} title={title} url={`/api/table-view?lng=${lng}&sector=${sector}&subsector=${subsector}&id=${id}`} />
                ) : <div className='flex items-center h-full'>
                    <Loading />
                </div>}
                <div className='mt-5' dangerouslySetInnerHTML={{ __html: metadataUrl }} />
            </div>
        </div>
    );
}