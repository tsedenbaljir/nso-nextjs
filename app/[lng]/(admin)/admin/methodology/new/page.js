"use client"
import { useState, useEffect } from 'react';
import InputItems from "@/components/admin/Edits/AddNew/InputItems";
import SelectInput from "@/components/admin/Edits/Select/SelectInput";
import Upload from "@/components/admin/Edits/UploadImages/Upload";
import { Select, DatePicker } from 'antd';
import dayjs from 'dayjs';

const Dashboard = () => {
    const [sector_types, setTypes] = useState([]);
    const [catalogue, setCatalogue] = useState([]);
    const [catalogue_val, setCatalogue_val] = useState([]);
    const [headerImageFile, setHeaderImageFile] = useState(null);
    const [title, setTitle] = useState('');
    const [newsType, setNewsType] = useState(1);
    const [language, setLanguage] = useState('mn');
    const [published, setPublished] = useState(true);
    const [user, setUser] = useState(null);

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

        async function data() {
            const response = await fetch('/api/subsectorlist');
            const sectors = await response.json();
            const allSubsectors = [];

            sectors.data.map((dt, index) => {
                allSubsectors.push({ id: index + 1, name: dt.text, value: dt.id })
            })
            setTypes(allSubsectors)
        }
        data();

        async function data_catalogue() {
            const response = await fetch('/api/data_catalogue');
            const sectors = await response.json();
            setCatalogue(sectors.data)
        }
        data_catalogue();

        fetchUser();
    }, []);

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Image upload failed');
            }

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let imageUrl = '';
            if (headerImageFile) {
                imageUrl = await uploadImage(headerImageFile);
            }

            const currentDate = new Date().toISOString();

            const articleData = {
                name: title,
                language: language.toUpperCase(),
                published: published,
                list_order: 0,
                created_by: user?.username || 'anonymousUser',
                created_date: currentDate,
                last_modified_date: currentDate,
                content_type: 'NSONEWS',
                news_type: newsType,
                published_date: currentDate,
                header_image: imageUrl,
                views: 0
            };

            const response = await fetch('/api/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(articleData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create article');
            }

            alert('Мэдээ амжилттай нэмэгдлээ');

        } catch (error) {
            console.error('Error posting data:', error);
            alert('Алдаа гарлаа: ' + error.message);
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
                <div className='flex flex-wrap gap-3 mb-4'>
                    <Select
                        mode="multiple"
                        style={{ width: '100%', height: 37 }}
                        placeholder="Дата каталоги"
                        onChange={(values) => {
                            setCatalogue_val(values);
                        }}
                        options={catalogue.map(item => ({
                            label: item.namemn,
                            value: item.id
                        }))}
                    />
                </div>
                <div className='flex flex-wrap gap-3 mb-4'>
                    <SelectInput
                        label="Статистикийн ангилал"
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
                            setHeaderImageFile={setHeaderImageFile}
                        />
                    </div>
                    <DatePicker className='mt-4' defaultValue={dayjs('2015/01/01', "DD/MM/YYYY")} format={"DD/MM/YYYY"} style={{ height: 50 }} />
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
            </div>
        </div>
    );
};

export default Dashboard;
