'use client';
import { useState } from 'react';
import styles from '../styles.module.scss';
import { useRouter } from 'next/navigation';
import { FileUpload } from 'primereact/fileupload';
import ClientStyles from '../ClientStyles';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/admin/Editor/editor'), {
    ssr: false,
    loading: () => <p>Уншиж байна...</p>
});
const CATEGORIES = [
    'Үйл ажиллагааны ил тод байдал',
    'Авлигын эсрэг арга хэмжээ',
    'Үйл ажиллагааны хөтөлбөр, тайлан',
    'Төрийн албаны зөвлөлийн Үндэсний статистикийн хорооны дэргэдэх салбар зөвлөл',
    'Хууль, эрх зүй',
    'Мэдээллийн аюулгүй байдлын бодлого',
    'Мэдээллийн аюулгүй байдлын зөрчил мэдээлэх'
];


export default function NewTransparency() {
    const router = useRouter();
    const [body, setBody] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        file: null,
        lng: 'mn'
    });

    const languages = [
        { label: 'Монгол', value: 'mn' },
        { label: 'English', value: 'en' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('description', body);
            if (formData.file) {
                data.append('file', formData.file);
            }
            data.append('lng', formData.lng);

            const response = await fetch('/api/transparency', {
                method: 'POST',
                body: data
            });

            const result = await response.json();
            if (result.status) {
                alert('Item added successfully');
                router.push('/mn/admin/transparency');
            } else {
                alert(result.message || 'Failed to add item');
            }
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Error adding item');
        }
    };

    const handleFileUpload = (event) => {
        const file = event.files[0];
        setFormData(prev => ({
            ...prev,
            file: file
        }));
    };

    return (
        <>
            <ClientStyles />
            <div className={styles.formContainer}>
                <h1>Шинэ мэдээлэл нэмэх</h1>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Хэл/Language:</label>
                        <select
                            value={formData.lng}
                            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                            required
                        >
                            {languages.map(lang => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Гарчиг:</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ангилал:</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="">Сонгоно уу</option>
                            {CATEGORIES.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                    <Editor setBody={setBody} />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Файл:</label>
                        <FileUpload
                            mode="basic"
                            accept="application/pdf"
                            maxFileSize={10000000}
                            onSelect={handleFileUpload}
                            auto
                            chooseLabel="PDF сонгох"
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit">Хадгалах</button>
                        <button type="button" onClick={() => router.back()}>
                            Буцах
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
} 