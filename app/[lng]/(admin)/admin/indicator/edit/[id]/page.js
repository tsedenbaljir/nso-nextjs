'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

export default function EditIndicator() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const toast = useRef(null);

    const [indicator, setIndicator] = useState({
        id: '',
        name: '',
        name_eng: '',
        indicator_type: '',
        catalogue_id: '',
        indicator: '',
        measure_type: '',
        image: '',
        info: '',
        info_eng: '',
        tableau: '',
        tableau_eng: '',
        published: '',
        updated_date: '',
        list_order: '',
        created_by: '',
        created_date: '',
        last_modified_by: '',
        last_modified_date: '',
        indicator_perc: ''
    });

    const categories = [
        { label: 'Үндсэн', value: 'main' },
        { label: 'Дунд', value: 'body' }
    ];

    useEffect(() => {
        if (id) {
            fetchIndicator(id);
        }
        else {
            router.push('/admin/indicator');
        }
    }, [id]);

    const fetchIndicator = async (id) => {
        try {
            const response = await fetch(`/api/indicators/get?id=${id}`);
            const result = await response.json();
            if (result.status) {
                setIndicator(result.data[0]);
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Алдаа',
                    detail: 'Үзүүлэлт олдсонгүй',
                    life: 3000
                });
                router.push('/admin/indicator');
            }
        } catch (error) {
            console.error('Error fetching indicator:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Алдаа',
                detail: 'Үзүүлэлт ачаалахад алдаа гарлаа',
                life: 3000
            });
        }
    };

    const handleFileUpload = (event) => {
        const file = event.files[0];
        setIndicator(prev => ({
            ...prev,
            file: file
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.keys(indicator).forEach(key => {
                if (key !== 'file') {
                    formData.append(key, indicator[key]);
                }
            });
            if (indicator.file) {
                formData.append('file', indicator.file);
            }

            const response = await fetch('/api/indicators/insert', {
                method: 'PUT',
                body: formData,
            });
            const result = await response.json();
            if (result.status) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Амжилттай',
                    detail: 'Үзүүлэлт амжилттай засагдлаа',
                    life: 3000
                });
                router.push('/admin/indicator');
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Алдаа',
                    detail: result.message || 'Үзүүлэлт засахад алдаа гарлаа',
                    life: 3000
                });
            }
        } catch (error) {
            console.error('Error saving indicator:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Алдаа',
                detail: 'Үзүүлэлт засахад алдаа гарлаа',
                life: 3000
            });
        }
    };

    return (
        <div className="w-full px-4 h-full">
            <Card className="p-4">
                <h2 className="text-xl font-bold mb-4">Үзүүлэлт засварлах</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-x-4 gap-y-10">
                    {[
                        { id: 'name', label: 'Нэр *' },
                        { id: 'name_eng', label: 'Нэр /Англи/' },
                        { id: 'indicator_type', label: 'Төрөл *', component: 'Dropdown', options: categories },
                        { id: 'indicator', label: 'Тоон үзүүлэлт' },
                        { id: 'indicator_perc', label: 'Өөрчлөлт' },
                        { id: 'info', label: 'Тоон үзүүлэлтийн хэмжих нэгж' },
                        { id: 'info_eng', label: 'Тоон үзүүлэлтийн хэмжих нэгж /Англи/' },
                        { id: 'measure_type', label: 'Өөрчлөлтийн хэмжих нэгж *' },
                        { id: 'last_modified_date', label: 'Шинэчилсэн огноо *', component: 'Calendar' },
                        { id: 'list_order', label: 'Эрэмбэ', component: 'InputNumber' },
                        { id: 'tableau', label: 'Холбоос' },
                        { id: 'image', label: 'Зураг', component: 'FileUpload' },
                    ].map(({ id, label, component, options }) => (
                        <div key={id} className="p-field w-[30%] h-[40px]">
                            <label htmlFor={id} className="block mb-1">{label}</label>
                            {component === 'Dropdown' ? (
                                <Dropdown id={id} value={indicator[id]} options={options} onChange={(e) => setIndicator({ ...indicator, [id]: e.value })} placeholder="Сонгоно уу" required className="w-full h-[40px] text-sm" />
                            ) : component === 'InputNumber' ? (
                                <InputNumber id={id} value={indicator[id]} onChange={(e) => setIndicator({ ...indicator, [id]: e.value })} required className="w-full h-[40px] text-sm" />
                            ) : component === 'Calendar' ? (
                                <Calendar id={id} value={indicator[id] ? new Date(indicator[id]) : null} onChange={(e) => setIndicator({ ...indicator, [id]: e.value })} required showIcon className="w-full h-[40px] text-sm" />
                            ) : component === 'FileUpload' ? (
                                <FileUpload mode="basic" name="file" accept="image/*" maxFileSize={10000000} onSelect={handleFileUpload} auto chooseLabel="Зураг сонгох" className="h-[40px] w-[120px]" />
                            ) : (
                                <InputText id={id} value={indicator[id]} onChange={(e) => setIndicator({ ...indicator, [id]: e.target.value })} required className="w-full h-[40px] text-sm" />
                            )}
                        </div>
                    ))}

                    <div className="p-field flex items-center bg-gray-100 px-4 rounded-md h-[40px] w-[30%] mt-4">
                        <input type="checkbox" id="published" checked={indicator.published} onChange={(e) => setIndicator({ ...indicator, published: e.target.checked })} className="mr-2" />
                        <label htmlFor="published">Идэвхтэй</label>
                    </div>

                    <div className="p-field col-span-3 flex justify-end gap-2 mt-4">
                        <Button label="Хадгалах" type="submit" icon="pi pi-save" className="h-[40px] w-[160px] bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 text-white" />
                        <Button label="Болих" type="button" icon="pi pi-times" onClick={() => router.push('/admin/indicator')} severity="secondary" className="h-[40px] w-[160px] bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 text-white" />
                    </div>
                </form>
            </Card>
            <Toast ref={toast} />
        </div>

    );
} 