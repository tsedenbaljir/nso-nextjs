"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoaderText from '@/components/Loading/Text/Index'
import InputItems from "@/components/admin/Edits/AddNew/InputItems"
import SelectInput from "@/components/admin/Edits/Select/SelectInput"
import Upload from "@/components/admin/Edits/UploadImages/Upload"
import { Select, DatePicker } from 'antd';

export default function EditMethodology({ params: { lng, id } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [sector_types, setTypes] = useState([])
    const [catalogue, setCatalogue] = useState([])
    const [title, setTitle] = useState('')
    const [newsType, setNewsType] = useState(1)
    const [language, setLanguage] = useState('mn')
    const [published, setPublished] = useState(true)
    const [uploadedFile, setUploadedFile] = useState(null)
    const [currentFileInfo, setCurrentFileInfo] = useState('')
    const [catalogue_val, setCatalogue_val] = useState([])
    const [user, setUser] = useState(null)

    useEffect(() => {
        fetchMethodology()
        fetchData()
    }, [id])

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/user');
                const data = await response.json();
                if (data.status) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);

    const fetchData = async () => {
        // Fetch sector types
        try {
            const response = await fetch('/api/subsectorlist');
            const sectors = await response.json();
            const allSubsectors = [];

            sectors.data.map((dt, index) => {
                allSubsectors.push({ id: index + 1, name: dt.text, value: dt.id })
            })
            setTypes(allSubsectors)
        } catch (error) {
            console.error('Error fetching sector types:', error);
        }

        // Fetch catalogue
        try {
            const response = await fetch('/api/data_catalogue');
            const sectors = await response.json();
            setCatalogue(sectors.data)
        } catch (error) {
            console.error('Error fetching catalogue:', error);
        }
    }

    const fetchMethodology = async () => {
        try {
            const response = await fetch(`/api/methodology/admin/${id}`)
            const data = await response.json()
            if (data.status) {
                const methodology = data.data
                setTitle(methodology.name || '')
                setNewsType(methodology.sector_type || 1)
                setLanguage(methodology.language?.toLowerCase() || 'mn')
                setPublished(methodology.published === 1)
                setCurrentFileInfo(methodology.file_info || '')
                
                // Set catalogue value if exists
                if (methodology.catalogue_id) {
                    setCatalogue_val([methodology.catalogue_id])
                }
            }
            setLoading(false)
        } catch (error) {
            console.error('Error fetching methodology:', error)
            setLoading(false)
        }
    }

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
                originalName: file.name,
                pathName: data.url || file.name,
                fileSize: file.size,
                extension: file.name.split('.').pop().toLowerCase(),
                mediaType: file.type,
                pages: 1,
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
        try {
            let fileInfo = currentFileInfo;

            if (uploadedFile) {
                try {
                    fileInfo = await uploadFile(uploadedFile);
                } catch (error) {
                    console.error('Error uploading file:', error);
                    alert('Файл хуулахад алдаа гарлаа!');
                    return;
                }
            }

            const methodologyData = {
                name: title,
                language: language.toUpperCase(),
                published: published ? 1 : 0,
                catalogue_id: catalogue_val.length > 0 ? catalogue_val[0] : null,
                sector_type: newsType,
                file_info: fileInfo,
                approved_date: published ? new Date().toISOString() : null
            };

            const response = await fetch(`/api/methodology/admin/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(methodologyData),
            });

            const data = await response.json();
            if (data.status) {
                alert('Аргачлал амжилттай засварлагдлаа');
                router.push('/admin/methodology');
            } else {
                throw new Error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating methodology:', error);
            alert('Аргачлал засварлахад алдаа гарлаа!');
        }
    };

    return (
        <div className="relative overflow-x-auto shadow-md pb-10">
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                <main className='dark:bg-black h-full'>
                    <div className="flex flex-grow items-center justify-between px-4 py-5 shadow-2 md:px-5 2xl:px-10">
                        <div className="flex items-center justify-normal gap-2 2xsm:gap-4 lg:w-full lg:justify-between xl:w-auto xl:justify-normal">
                            <div className="nso_btn nso_btn_default font-extrabold text-xl">
                                Аргачлал засах
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            {!loading ? <div className="items-center justify-between px-4 md:px-5 2xl:px-10">
                <div className='flex flex-wrap gap-3 mb-4'>
                    <InputItems name={"Гарчиг"} data={title} setData={setTitle} />
                </div>
                <div className='flex flex-wrap gap-3 mb-4'>
                    <Select
                        style={{ width: '50%', height: 37 }}
                        placeholder="Дата каталоги"
                        value={catalogue_val.length > 0 ? catalogue_val[0] : undefined}
                        onChange={(value) => {
                            setCatalogue_val([value]);
                        }}
                        options={catalogue.map(item => ({
                            label: item.namemn,
                            value: item.id
                        }))}
                    />
                    <SelectInput
                        label="Статистикийн ангилал"
                        setFields={setNewsType}
                        value={newsType}
                        data={sector_types}
                    />
                    <SelectInput
                        label="Хэл"
                        setFields={(value) => setLanguage(value === 1 ? 'mn' : 'en')}
                        value={language === 'mn' ? 1 : 2}
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
                    <DatePicker className='mt-4' style={{ height: 50 }} />
                    <div className="flex items-center bg-gray-100 px-2 rounded-md mt-4" style={{ height: 50 }}>
                        <input
                            type="checkbox"
                            id="publishedCheckbox"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                            className="mr-2"
                        />
                        <label htmlFor="publishedCheckbox">Нийтлэх</label>
                    </div>
                </div>
                <div className='float-right pt-4'>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/methodology')}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-black bg-gray hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Буцах
                    </button>
                    <button
                        onClick={handleSubmit}
                        type="submit"
                        className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Хадгалах
                    </button>
                </div>
            </div> : <div className="items-center justify-between px-4 md:px-5 2xl:px-10 h-full">
                <LoaderText />
            </div>
            }
        </div>
    )
}
