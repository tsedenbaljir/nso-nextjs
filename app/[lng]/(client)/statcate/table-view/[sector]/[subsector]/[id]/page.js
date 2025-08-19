"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VariablesPanel from '@/components/table-view/VariablePanel';
import Loading from '@/components/Loader';
import DataQueryInterface from '@/components/DataQueryInterface';
import { Collapse, Space } from 'antd';
import { ApiOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

export default function TableView({ params }) {
    const lng = params.lng;
    const sector = params.sector;
    const subsector = params.subsector;
    const id = params.id;
    const searchParams = useSearchParams();
    const subtables = searchParams.get('subtables');

    const [selectedValues, setSelectedValues] = useState({});
    const [metadataUrl, setMetadata] = useState('');
    const [title, setTitle] = useState('');
    const [variables, setVariables] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getData() {
            try {
                setLoading(true);
                // Fetch the table data
                const res = await fetch(`/api/table-view?lng=${lng}&sector=${sector}&subsector=${subsector}&id=${id}${subtables ? `&subtables=${subtables}` : ''}`);
                if (!res.ok) {
                    setLoading(false);
                    setTitle('');
                    setVariables([]);
                    throw new Error('Failed to fetch data');
                } else {
                    const json = await res.json();
                    if (json.title) {
                        setTitle(json.title);
                        setVariables(json.variables);
                    } else {
                        setTitle('');
                        setVariables([]);
                    }
                }
            } catch (error) {
                console.log("error getdatas", error);
            } finally {
                setLoading(false);
            }
        }
        getData();
        async function getMetadata() {
            try {
                // Fetch the URL
                const resMetadata = await fetch(`/api/table-view/metadata?lng=${lng}&sector=${sector}&subsector=${subsector}&id=${id}${subtables ? `&subtables=${subtables}` : ''}`);

                if (!resMetadata.ok) {
                    setLoading(false);
                    setMetadata([]);
                    throw new Error('Failed to fetch metadata');
                }

                const data = await resMetadata.json();
                if (data.error) {
                    console.error('Error fetching metadata:', data.error);
                    setMetadata([]);
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
    }, [params, subtables]);

    return (
        <div className="nso_container">
            <div className="w-full my-5">
                <h1 className='text-2xl font-medium mb-6'>{title}</h1>
                {loading ? (
                    <div className='flex items-center justify-center h-64'>
                        <Loading />
                    </div>
                ) : variables.length > 0 ? (
                    <VariablesPanel variables={variables} title={title} url={`/api/table-view?lng=${lng}&sector=${sector}&subsector=${subsector}&id=${id}${subtables ? `&subtables=${subtables}` : ''}`} lng={lng} setSelectedValues={setSelectedValues} selectedValues={selectedValues} />
                ) : (
                    <div className='flex items-center justify-center h-64'>
                        <p className='text-gray-500 text-lg'>{lng === 'mn' ? 'Хүснэгтийн мэдээлэл олдсонгүй' : 'No data found'}</p>
                    </div>
                )}

                <div className='mt-5' dangerouslySetInnerHTML={{ __html: metadataUrl }} />

                {/* Data Query Interface */}
                <div className="mt-8">
                    <Collapse>
                        <Panel
                            header={
                                <Space>
                                    <ApiOutlined />
                                    <span className='text-lg font-normal'>Дараах хаягаас POST хүсэлт илгээх</span>
                                </Space>
                            }
                            key="1"
                        >
                            <DataQueryInterface subtables={subtables} sector={sector} subsector={subsector} id={id} lng={lng} selectedValues={selectedValues} />
                        </Panel>
                    </Collapse>
                </div>
            </div>
        </div>
    );
}