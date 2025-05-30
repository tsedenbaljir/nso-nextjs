"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Editor from '@/components/admin/Editor/editor'
import InputItems from "@/components/admin/Edits/AddNew/InputItems";
import SelectInput from "@/components/admin/Edits/Select/SelectInput";
import Upload from "@/components/admin/Edits/UploadImages/Upload";

export default function NewDissemination() {
    const router = useRouter();
    const [body, setBody] = useState('');
    const [headerImageFile, setHeaderImageFile] = useState(null);
    const [title, setTitle] = useState('');
    const [newsType, setNewsType] = useState('LATEST');
    const [language, setLanguage] = useState('mn');
    const [published, setPublished] = useState(true);
    const [publishedDate, setPublishedDate] = useState('');
    const [user, setUser] = useState(null);
    const [slug, setSlug] = useState('');

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

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Image upload failed');

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
                body: body,
                published: published,
                list_order: 0,
                created_by: user?.username || 'anonymousUser',
                created_date: currentDate,
                last_modified_date: currentDate,
                content_type: 'NEWS',
                news_type: newsType,
                published_date: publishedDate || currentDate,
                header_image: imageUrl,
                views: 0,
                slug: slug
            };

            const response = await fetch('/api/dissemination/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(articleData),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Failed to create article');

            alert('Мэдээ амжилттай нэмэгдлээ');
            router.push('/admin/dissemination');

        } catch (error) {
            console.error('Error posting data:', error);
            alert('Алдаа гарлаа: ' + error.message);
        }
    };

    return (
            <div className="relative overflow-x-auto shadow-md pb-10">
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <main className='dark:bg-black h-full'>
                        <div className="flex flex-grow items-center justify-between px-4 py-5 shadow-2 md:px-5 2xl:px-10">
                            <div className="flex items-center justify-normal gap-2 2xsm:gap-4 lg:w-full lg:justify-between xl:w-auto xl:justify-normal">
                                <div className="nso_btn nso_btn_default font-extrabold text-xl">
                                    Тархаах мэдээ нэмэх
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
                <div className="items-center justify-between px-4 md:px-5 2xl:px-10">
                    <div className='flex flex-wrap gap-3 mb-4'>
                        <SelectInput
                            setFields={(value) => setNewsType(value === 1 ? 'LATEST' : 'FUTURE')}
                            data={[
                                { id: 1, name: "Сүүлд гарсан" },
                                { id: 2, name: "Удахгүй гарах" }
                            ]}
                        />
                        <SelectInput
                            setFields={(value) => setLanguage(value === 1 ? 'mn' : 'en')}
                            data={[
                                { id: 1, name: "MN" },
                                { id: 2, name: "EN" }
                            ]}
                        />
                        <div className="flex items-center">
                            <input
                                type="date"
                                value={publishedDate.split('T')[0]}
                                onChange={(e) => setPublishedDate(e.target.value)}
                                className="border rounded px-2 py-1"
                            />
                        </div>
                        <InputItems
                            name={"Хамрах хүрээ"}
                            data={slug}
                            setData={setSlug}
                            placeholder="my-article-url"
                        />
                        <div className="flex items-center bg-gray-100 px-2 rounded-md">
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
                    <div className='flex flex-wrap gap-3 mb-4'>
                        <InputItems name={"Гарчиг"} data={title} setData={setTitle} />
                    </div>
                    <div className='flex flex-wrap gap-3 mb-6'>
                        <Upload setHeaderImageFile={setHeaderImageFile} />
                    </div>
                    <Editor setBody={setBody} />
                    <div className='float-right pt-4'>
                        <button
                            type="button"
                            onClick={() => router.push('/admin/dissemination')}
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
}
