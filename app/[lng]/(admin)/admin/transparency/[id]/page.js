'use client';
import { useEffect, useState } from 'react';
import styles from '../styles.module.scss';
import { useRouter } from 'next/navigation';
import { FileUpload } from 'primereact/fileupload';
import ClientStyles from '../ClientStyles';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
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
    'Мэдээллийн аюулгүй байдлын зөрчил мэдээлэх',
    'Жендэрийн салбар зөвлөл'
];

export default function EditTransparency({ params }) {
    const [body, setBody] = useState('');
    const router = useRouter();
    const { id } = params;
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        file: null
    });
    const [loading, setLoading] = useState(true);
    const toast = useRef(null);

    useEffect(() => {
        fetchTransparencyItem();
    }, [id]);

    const fetchTransparencyItem = async () => {
        try {
            const response = await fetch(`/api/transparency/${id}`);
            const result = await response.json();
            if (result.status && result.data) {
                setFormData({
                    title: result.data.title,
                    category: result.data.category,
                    description: result.data.description,
                    file_path: result.data.file_path,
                    file: null
                });
                setBody(result.data.description || "<p></p>");
            }
        } catch (error) {
            console.error('Error fetching item:', error);
            showError('Мэдээлэл татахад алдаа гарлаа');
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (message) => {
        toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: message,
            life: 3000
        });
    };

    const showError = (message) => {
        toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: message,
            life: 3000
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();
            data.append('id', id);
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('description', body); 
            if (formData.file) {
                data.append('file', formData.file);
            }

            const response = await fetch(`/api/transparency`, {
                method: 'PUT',
                body: data
            });

            const result = await response.json();
            if (result.status) {
                showSuccess('Амжилттай хадгалагдлаа');
                setTimeout(() => {
                    router.push('/mn/admin/transparency');
                }, 1000);
            } else {
                showError(result.message || 'Хадгалахад алдаа гарлаа');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            showError('Хадгалахад алдаа гарлаа');
        }
    };

    const handleFileUpload = (event) => {
        const file = event.files[0];
        setFormData(prev => ({
            ...prev,
            file: file
        }));
    };

    if (loading) {
        return (
            <>
                <ClientStyles />
                <div className={styles.formContainer}>
                    <h1>Уншиж байна...</h1>
                </div>
            </>
        );
    }

    return (
        <>
            <ClientStyles />
            <Toast ref={toast} />
            <div className={styles.formContainer}>
                <h1>Мэдээлэл засварлах</h1>
                <form onSubmit={handleSubmit}>
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
                    <Editor
                        setBody={setBody}
                        defaultValue={body}
                    />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Файл (хуучин файлыг солих бол):</label>
                        <FileUpload
                            mode="basic"
                            accept="application/pdf"
                            maxFileSize={10000000}
                            onSelect={handleFileUpload}
                            auto
                            chooseLabel="PDF сонгох"
                        />
                        {formData.file_path && (
                            <div className={styles.currentFile}>
                                <span>Одоогийн файл: </span>
                                <a href={formData.file_path} target="_blank" rel="noopener noreferrer">
                                    Харах
                                </a>
                            </div>
                        )}
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