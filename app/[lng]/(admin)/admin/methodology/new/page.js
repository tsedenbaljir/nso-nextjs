"use client"
import { useState, useEffect } from 'react';
import InputItems from "@/components/admin/Edits/AddNew/InputItems";
import SelectInput from "@/components/admin/Edits/Select/SelectInput";
import Upload from "@/components/admin/Edits/UploadImages/Upload";
import { Select, DatePicker } from 'antd';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const Dashboard = () => {
    const router = useRouter();
    const [sector_types, setTypes] = useState([]);
    // const [catalogue, setCatalogue] = useState([]);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [title, setTitle] = useState('');
    const [newsType, setNewsType] = useState(1);
    const [language, setLanguage] = useState('mn');
    const [published, setPublished] = useState(true);
    const [publishedDate, setPublishedDate] = useState(dayjs());
    const [saving, setSaving] = useState(false);
    // const [catalogue_val, setCatalogue_val] = useState([]);

    useEffect(() => {

        async function data() {
            const response = await fetch('https://www.nso.mn/api/subsectorlist');
            const sectors = await response.json();
            const allSubsectors = [];
            sectors.data.map((dt, index) => {
                allSubsectors.push({ id: index + 1, name: dt.sector + " - " + dt.text, value: dt.id })
            })
            setTypes(allSubsectors)
        }
        data();

        // async function data_catalogue() {
        //     const response = await fetch('https://www.nso.mn/api/data_catalogue');
        //     const sectors = await response.json();
        //     // Transform data to match SelectInput format
        //     const catalogueData = sectors.data.map((item, index) => ({
        //         id: index + 1,
        //         name: item.namemn,
        //         value: item.id
        //     }));
        //     setCatalogue(catalogueData)
        // }
        // data_catalogue();
    }, []);

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('File upload failed');
            }

            const data = await response.json();

            // Create file_info object with metadata
            const fileInfo = {
                originalName: data.filename,
                pathName: data.url || file.name,
                fileSize: file.size,
                extension: file.name.split('.').pop().toLowerCase(),
                mediaType: file.type,
                pages: 1, // Default value, can be updated if needed
                downloads: 0,
                isPublic: true,
                createdDate: new Date().toISOString()
            };

            return JSON.stringify(fileInfo);
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            let fileInfo = '';
            if (uploadedFile) {
                fileInfo = await uploadFile(uploadedFile);
            }

            // const currentDate = new Date().toISOString();
            const methodologyData = {
                name: title,
                language: language.toUpperCase(),
                published: published ? 1 : 0,
                // sector_type: catalogue[catalogue_val - 1].value || null,
                // catalogue_id: catalogue_val.length > 0 ? catalogue_val[0] : null,
                catalogue_id: sector_types[newsType - 1]?.value || null,
                sector_type: sector_types[newsType - 1]?.value || null,
                file_info: fileInfo,
                created_date: publishedDate ? publishedDate.toISOString() : null,
                last_modified_date: publishedDate ? publishedDate.toISOString() : null,
                approved_date: published && publishedDate ? publishedDate.toISOString() : null,
                views: 0,
                list_order: 0
            };

            const response = await fetch('/api/methodology/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(methodologyData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create methodology');
            }

            alert('Аргачлал амжилттай нэмэгдлээ');
            router.push('/mn/admin/methodology');
        } catch (error) {
            console.error('Error posting data:', error);
            alert('Алдаа гарлаа: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="relative overflow-x-auto shadow-md pb-10 h-full">
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                <main className='dark:bg-black h-full'>
                    <div className="flex flex-grow items-center justify-between px-4 py-5 shadow-2 md:px-5 2xl:px-10">
                        <div className="flex items-center justify-normal gap-2 2xsm:gap-4 lg:w-full lg:justify-between xl:w-auto xl:justify-normal">
                            <div className="nso_btn nso_btn_default font-extrabold text-xl">
                                Аргачлал, арга зүй нэмэх
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <div className="items-center justify-between px-4 md:px-5 2xl:px-10">
                <div className='flex flex-wrap gap-3 mb-4'>
                    <InputItems name={"Гарчиг"} data={title} setData={setTitle} />
                </div>
                {/* <div className='flex flex-wrap gap-3 mb-4'>
                    <label>Дата каталоги</label>
                    <Select
                        style={{ width: '50%', height: 37 }}
                        placeholder="Сонгох"
                        // value={catalogue_val.length > 0 ? catalogue_val[0] : undefined}
                        onChange={(value) => {
                            setCatalogue_val([value]);
                        }}
                        options={catalogue.map(item => ({
                            label: item.name,
                            value: item.value
                        }))}
                    />
                </div> */}
                <div className='flex flex-wrap gap-3 mb-4'>
                    <SelectInput
                        label="Статистикийн ангилал"
                        placeholder="Сонгох"
                        setFields={setNewsType}
                        data={sector_types}
                    />
                    <SelectInput
                        label="Хэл"
                        setFields={(value) => setLanguage(value === 1 ? 'mn' : 'en')}
                        data={[
                            { id: 1, name: "MN" },
                            { id: 2, name: "EN" }
                        ]}
                    />
                </div>
                <div className='flex flex-wrap gap-3 mb-4' >
                    <div className='flex flex-wrap gap-3 mb-6'>
                        <Upload
                            setHeaderImageFile={setUploadedFile}
                        />
                    </div>
                    <DatePicker 
                        className='mt-4' 
                        value={publishedDate} 
                        onChange={(date) => setPublishedDate(date)} 
                        style={{ height: 50 }} 
                        placeholder="Огноо сонгох"
                    />
                    <div className="flex items-center bg-gray-100 px-2 rounded-md mt-4" style={{ height: 50 }}>
                        <input
                            type="checkbox"
                            id="publishedCheckbox"
                            checked={published}
                            onChange={(e) => {
                                setPublished(e.target.checked)
                            }}
                            className="mr-2"
                        />
                        <label htmlFor="publishedCheckbox">Нийтлэх</label>
                    </div>
                </div>
                <div className='float-right pt-4'>
                    <button
                        type="button"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-black bg-gray hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Буцах
                    </button>
                    <button
                        onClick={handleSubmit}
                        type="submit"
                        disabled={saving}
                        className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Хадгалж байна...
                            </>
                        ) : (
                            'Хадгалах'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
