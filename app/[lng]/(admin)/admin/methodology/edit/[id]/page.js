"use client"
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation'
import LoaderText from '@/components/Loading/Text/Index'
import InputItems from "@/components/admin/Edits/AddNew/InputItems"
import SelectInput from "@/components/admin/Edits/Select/SelectInput"
import Upload from "@/components/admin/Edits/UploadImages/Upload"

const Editor = dynamic(() => import('@/components/admin/Editor/editor'), {
    ssr: false,
    loading: () => <p>Уншиж байна...</p>
});
export default function EditNews({ params: { lng, id } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [title, setTitle] = useState('')
    const [body, setBody] = useState("<p></p>")
    const [newsType, setNewsType] = useState(1)
    const [language, setLanguage] = useState('mn')
    const [published, setPublished] = useState(true)
    const [headerImageFile, setHeaderImageFile] = useState(null)
    const [publishedDate, setPublishedDate] = useState('')
    const [currentImage, setCurrentImage] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchArticle()
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

    const fetchArticle = async () => {
        try {
            const response = await fetch(`/api/articles/admin/${id}`)
            const data = await response.json()
            if (data.status) {
                const article = data.data
                setTitle(article.name)
                setBody(article.body || "<p></p>")
                setNewsType(article.news_type === 'LATEST' ? 1 : 2)
                setLanguage(article.language.toLowerCase())
                setPublished(article.published)
                setPublishedDate(article.published_date)
                setCurrentImage(article.header_image)
            }
            setLoading(false)
        } catch (error) {
            console.error('Error fetching article:', error)
            setLoading(false)
        }
    }

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
            let imageUrl = currentImage;

            if (headerImageFile) {
                try {
                    imageUrl = await uploadImage(headerImageFile);
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Зураг хуулахад алдаа гарлаа!');
                    return;
                }
            }

            const articleData = {
                name: title,
                body: body,
                language: language.toUpperCase(),
                published: published,
                news_type: newsType === 1 ? 'LATEST' : 'MEDIA',
                published_date: publishedDate || new Date().toISOString(),
                header_image: imageUrl,
                last_modified_by: user?.username || 'anonymousUser',
                last_modified_date: new Date().toISOString()
            };

            const response = await fetch(`/api/articles/admin/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(articleData),
            });

            const data = await response.json();
            if (data.status) {
                alert('Мэдээ амжилттай засварлагдлаа');
                router.push('/admin/news');
            } else {
                throw new Error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating article:', error);
            alert('Мэдээ засварлахад алдаа гарлаа!');
        }
    };

    return (
            <div className="relative overflow-x-auto shadow-md pb-10">
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <main className='dark:bg-black h-full'>
                        <div className="flex flex-grow items-center justify-between px-4 py-5 shadow-2 md:px-5 2xl:px-10">
                            <div className="flex items-center justify-normal gap-2 2xsm:gap-4 lg:w-full lg:justify-between xl:w-auto xl:justify-normal">
                                <div className="nso_btn nso_btn_default font-extrabold text-xl">
                                    Мэдээ засах
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
                {!loading ? <div className="items-center justify-between px-4 md:px-5 2xl:px-10">
                    <div className='flex flex-wrap gap-3 mb-4'>
                        <SelectInput
                            setFields={setNewsType}
                            value={newsType}
                            data={[
                                { id: 1, name: "Шинэ мэдээ" },
                                { id: 2, name: "Медиа мэдээ" },
                                { id: 3, name: "Тендер" }
                            ]}
                        />
                        <SelectInput
                            setFields={(value) => setLanguage(value === 1 ? 'mn' : 'en')}
                            value={language === 'mn' ? 1 : 2}
                            data={[
                                { id: 1, name: "MN" },
                                { id: 2, name: "EN" }
                            ]}
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
                        <Upload
                            setHeaderImageFile={setHeaderImageFile}
                        />
                    </div>
                    <Editor
                        setBody={setBody}
                        defaultValue={body}
                    />
                    <div className='float-right pt-4'>
                        <button
                            type="button"
                            onClick={() => router.push('/admin/news/all')}
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
