"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import SelectInput from '@/components/admin/Edits/Select/SelectInput';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/admin/Editor/editor'), {
    ssr: false,
    loading: () => <p>Loading editor...</p>
});

export default function WorkspaceForm({ id, lng }) {
    const router = useRouter();
    const toast = useRef(null);
    const [loading, setLoading] = useState(false);

    // Separate states for each field
    const [name, setName] = useState('');
    const [body, setBody] = useState('');
    const [location, setLocation] = useState("11");
    const [language, setLanguage] = useState(lng.toUpperCase());

    const languageData = [
        { id: 'MN', name: 'Монгол' },
        { id: 'EN', name: 'English' }
    ];

    const locationData = [
        { id: "65", name: "Архангай" },
        { id: "83", name: "Баян-Өлгий" },
        { id: "64", name: "Баянхонгор" },
        { id: "63", name: "Булган" },
        { id: "82", name: "Говь-Алтай" },
        { id: "42", name: "Говьсүмбэр" },
        { id: "45", name: "Дархан-Уул" },
        { id: "44", name: "Дорноговь" },
        { id: "21", name: "Дорнод" },
        { id: "48", name: "Дундговь" },
        { id: "81", name: "Завхан" },
        { id: "61", name: "Орхон" },
        { id: "62", name: "Өвөрхангай" },
        { id: "46", name: "Өмнөговь" },
        { id: "22", name: "Сүхбаатар" },
        { id: "43", name: "Сэлэнгэ" },
        { id: "16", name: "Бүгд" },
        { id: "41", name: "Төв" },
        { id: "85", name: "Увс" },
        { id: "84", name: "Ховд" },
        { id: "67", name: "Хөвсгөл" },
        { id: "23", name: "Хэнтий" },
        { id: "11", name: "Улаанбаатар" }
    ];

    useEffect(() => {
        if (id) {
            fetchWorkspace();
        }
    }, [id]);

    const fetchWorkspace = async () => {
        try {
            const response = await fetch(`/api/workspace/admin/${id}?language=${language}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const result = await response.json();
            if (result.status) {
                const data = result.data;
                setName(data.name);
                setBody(data.body);
                setLocation(data.location);
                setLanguage(data.language);
            }
        } catch (error) {
            console.error('Error fetching workspace:', error);
            toast.current.show({
                severity: 'error',
                summary: lng === 'mn' ? 'Алдаа' : 'Error',
                detail: error.message
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = id
                ? `/api/workspace/admin/${id}`
                : '/api/workspace/admin';

            const method = id ? 'PUT' : 'POST';

            const formData = {
                name,
                body,
                location,
                language
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.status) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Амжилттай',
                    detail: 'Амжилттай хадгалагдлаа'
                });
                router.push(`/${lng}/admin/workspace`);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: lng === 'mn' ? 'Алдаа' : 'Error',
                detail: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageChange = (value) => {
        setLanguage(value);
        if (id) {
            fetchWorkspace();
        }
    };

    return (
        <div className="card p-4">
            <Toast ref={toast} />

            <h1 className="text-2xl font-bold mb-4">
                {id
                    ? 'Ажлын байр засах'
                    : 'Шинэ ажлын байр'
                }
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <SelectInput
                        label={'Хэл'}
                        data={languageData}
                        value={language}
                        setFields={handleLanguageChange}
                    />
                    <SelectInput
                        label={'Байршил'}
                        data={locationData}
                        value={location}
                        setFields={setLocation}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label>{'Нэр'}</label>
                    <InputText
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Editor setBody={setBody} defaultValue={id ? body : ''} />
                </div>

                <div className="items-center justify-between px-4 md:px-5 2xl:px-10">
                    <div className='float-right pt-4'>
                        <button
                            type="button"
                            onClick={() => router.push(`/${lng}/admin/workspace`)}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-black bg-gray hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Буцах
                        </button>
                        <button
                            type="submit"
                            className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Хадгалах
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
} 