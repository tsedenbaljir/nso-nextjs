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
                const url = `https://data.1212.mn/pxweb/${lng}/NSO/NSO__${sector}__${subsector}/${id}`;
                // Fetch the URL
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const contentType = response.headers.get('Content-Type');
                const metadata = await response.text();
                // If the response is not HTML, warn and exit early
                if (!contentType.includes('text/html')) {
                    console.warn('Response is not HTML. Likely a PC-Axis file or other format. Cannot find SelectionPage or footnotes_container.');
                    return;
                }

                // Parse as HTML (browser-only)
                if (typeof DOMParser !== 'undefined') {
                    const parser = new DOMParser();
                    const htmlDocument = parser.parseFromString(metadata, 'text/html');

                    // Get content from pxwebcontent
                    const wrapElement = htmlDocument.getElementById('pxwebcontent');
                    const SelectionPage = wrapElement.querySelector('#SelectionPage');
                    if (SelectionPage) {
                        const secondDiv = SelectionPage.querySelector('#ctl00_ContentPlaceHolderMain_divFootnotes');
                        if (secondDiv) {
                            setMetadata(secondDiv.innerHTML);
                        } else {
                            console.log('Could not find second div in SelectionPage in pxwebcontent');
                        }
                    } else {
                        console.log('Could not find element with class "SelectionPage" in pxwebcontent');
                    }
                } else {
                    console.log('DOMParser not available (e.g., in Node.js). Cannot parse HTML.');
                }
            } catch (error) {
                console.error('Error fetching or parsing data:', error);
            }
            // 
            const res = await fetch(`/api/table-view?lng=${lng}&sector=${sector}&subsector=${subsector}&id=${id}`);
            if (!res.ok) {
                throw new Error('Failed to fetch data');
            }
            const json = await res.json();
            setTitle(json.title);
            setVariables(json.variables);
        }
        getData();
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
                {/* <div className="mt-10">
                    <h2 className="text-xl font-medium mb-4">Мета мэдээлэл</h2>
                    <table className="min-w-full border rounded-lg overflow-hidden">
                        <tbody>
                            <tr className="bg-[#f8fbff]">
                                <th className="p-3 font-medium text-gray-700 text-center">1</th>
                                <th className="p-3 font-medium text-gray-700 text-left w-[320px]">Тодорхойлолт</th>
                                <td className="p-3 text-gray-900">Нас харгалзалгүйгээр тодорхой түвшний нийт суралцагчдын тоог тухайн хичээлийн жилд тэр түвшинд суралцвал зохих насны нийт хүүхдэд эзлэх хувиар илэрхийлсэн үзүүлэлт юм.</td>
                            </tr>
                            <tr className="">
                                <th className="p-3 font-medium text-gray-700 text-center">2</th>
                                <th className="p-3 font-medium text-gray-700 text-left w-[320px]">Аргачлал, арга зүйн нэр</th>
                                <td className="p-3 text-gray-900">Боловсролын статистикийн үзүүлэлт тооцох аргачлал ( ҮСХ-ны даргын 2013 оны 12 сарын 16-ны өдрийн 01/145 тоот тушаал )</td>
                            </tr>
                            <tr className="bg-[#f8fbff]">
                                <th className="p-3 font-medium text-gray-700 text-center">3</th>
                                <th className="p-3 font-medium text-gray-700 text-left w-[320px]">Мэдээлэл шинэчилсэн хугацаа</th>
                                <td className="p-3 text-gray-900">2025.04.11</td>
                            </tr>
                            <tr className="">
                                <th className="p-3 font-medium text-gray-700 text-center">4</th>
                                <th className="p-3 font-medium text-gray-700 text-left w-[320px]">Хэмжих нэгж</th>
                                <td className="p-3 text-gray-900">%</td>
                            </tr>
                            <tr className="bg-[#f8fbff]">
                                <th className="p-3 font-medium text-gray-700 text-center">5</th>
                                <th className="p-3 font-medium text-gray-700 text-left w-[320px]">Үзүүлэлтийг тооцох давтамж</th>
                                <td className="p-3 text-gray-900">Annual</td>
                            </tr>
                            <tr className="">
                                <th className="p-3 font-medium text-gray-700 text-center">6</th>
                                <th className="p-3 font-medium text-gray-700 text-left w-[320px]">Мэдээлэл шинэчлэгдэх өдөр</th>
                                <td className="p-3 text-gray-900">2025.05.21</td>
                            </tr>
                            <tr className="bg-[#f8fbff]">
                                <th className="p-3 font-medium text-gray-700 text-center">7</th>
                                <th className="p-3 font-medium text-gray-700 text-left w-[320px]">Тооцож эхэлсэн хугацаа</th>
                                <td className="p-3 text-gray-900">2012.05.21</td>
                            </tr>
                            <tr className="">
                                <th className="p-3 font-medium text-gray-700 text-center">8</th>
                                <th className="p-3 font-medium text-gray-700 text-left w-[320px]">Copyright</th>
                                <td className="p-3 text-gray-900">No</td>
                            </tr>
                            <tr className="bg-[#f8fbff]">
                                <th className="p-3 font-medium text-gray-700 text-center">9</th>
                                <th className="p-3 font-medium text-gray-700 text-left w-[320px]">Эх сурвалж</th>
                                <td className="p-3 text-gray-900">Боловсролын яам</td>
                            </tr>
                            <tr className="">
                                <th className="p-3 font-medium text-gray-700 text-center">10</th>
                                <th className="p-3 font-medium text-gray-700 text-left w-[320px]">Matrix</th>
                                <td className="p-3 text-gray-900">DT_NSO_2002_012V1</td>
                            </tr>
                            <tr className="bg-[#f8fbff]">
                                <th className="p-3 font-medium text-gray-700 text-center">11</th>
                                <th className="p-3 font-medium text-gray-700 text-left w-[320px]">Мета мэдээллийн дэлгэрэнгүй</th>
                                <td className="p-3 text-blue-600 hover:underline cursor-pointer">
                                    <a href="https://www.1212.mn/mn/data-base/meta-data/indicator/290" target="_blank" rel="noopener noreferrer">Мета мэдээллийн дэлгэрэнгүйг харах</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div> */}
            </div>
        </div>
    );
}
