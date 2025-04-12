'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

export default function EditIndicator() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const toast = useRef(null);

    const [indicator, setIndicator] = useState({
        name: '',
        name_eng: '',
        indicator_type: '',
        indicator: '',
        measure_type: '',
        info: '',
        info_eng: '',
        tableau: '',
        tableau_eng: '',
        published: false,
        indicator_perc: 0,
        created_by: '',
        created_date: '',
        last_modified_date: ''
    });

    const categories = [
        { label: 'Үндсэн', value: 'main' },
        { label: 'Дунд', value: 'body' }
    ];

    useEffect(() => {
        if (id) {
            fetchIndicator(id);
        } else {
            router.push('/admin/indicator');
        }
    }, [id]);

    const fetchIndicator = async (id) => {
        try {
            const response = await fetch(`/api/mainIndicators?id=${id}`);
            const result = await response.json();
            if (result.status) {
                setIndicator(result.data);
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

            const response = await fetch('/api/mainIndicators', {
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
        <div className="w-full px-2 h-full">
            <Card className="p-4">
                <h2 className="text-xl font-bold mb-4">Үзүүлэлт засварлах</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <div className="p-field">
                        <label htmlFor="name">Нэр</label>
                        <InputText
                            id="name"
                            value={indicator.name}
                            onChange={(e) => setIndicator({ ...indicator, name: e.target.value })}
                            required
                            style={{ width: 500 }}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="name_eng">Англи нэр</label>
                        <InputText
                            id="name_eng"
                            value={indicator.name_eng}
                            onChange={(e) => setIndicator({ ...indicator, name_eng: e.target.value })}
                            required
                            style={{ width: 500 }}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="indicator_type">Төрөл</label>
                        <Dropdown
                            id="indicator_type"
                            value={indicator.indicator_type}
                            options={categories}
                            onChange={(e) => setIndicator({ ...indicator, indicator_type: e.value })}
                            placeholder="Сонгоно уу"
                            required
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="indicator">Үзүүлэлт</label>
                        <InputText
                            id="indicator"
                            value={indicator.indicator}
                            onChange={(e) => setIndicator({ ...indicator, indicator: e.target.value })}
                            required
                            style={{ width: 500 }}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="measure_type">Хэмжих төрөл</label>
                        <InputText
                            id="measure_type"
                            value={indicator.measure_type}
                            onChange={(e) => setIndicator({ ...indicator, measure_type: e.target.value })}
                            required
                            style={{ width: 500 }}
                        />
                    </div>
                    <div className="p-field col-span-2">
                        <label htmlFor="info">Мэдээлэл</label>
                        <InputText
                            id="info"
                            value={indicator.info}
                            onChange={(e) => setIndicator({ ...indicator, info: e.target.value })}
                            required
                            rows={3}
                            style={{ width: 500 }}
                        />
                    </div>
                    <div className="p-field col-span-2">
                        <label htmlFor="info_eng">Англи мэдээлэл</label>
                        <InputText
                            id="info_eng"
                            value={indicator.info_eng}
                            onChange={(e) => setIndicator({ ...indicator, info_eng: e.target.value })}
                            required
                            rows={3}
                            style={{ width: 500 }}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="tableau">Tableau</label>
                        <InputText
                            id="tableau"
                            value={indicator.tableau}
                            onChange={(e) => setIndicator({ ...indicator, tableau: e.target.value })}
                            required
                            style={{ width: 500 }}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="tableau_eng">Англи Tableau</label>
                        <InputText
                            id="tableau_eng"
                            value={indicator.tableau_eng}
                            onChange={(e) => setIndicator({ ...indicator, tableau_eng: e.target.value })}
                            required
                            style={{ width: 500 }}
                        />
                    </div>
                    <div className="p-field">
                        <div className="flex items-center bg-gray-100 px-2 rounded-md">
                            <input
                                type="checkbox"
                                id="published"
                                checked={indicator.published}
                                onChange={(e) => setIndicator({ ...indicator, published: e.target.checked })}
                                className="mr-2"
                            />
                            <label htmlFor="published">Нийтлэх</label>
                        </div>
                    </div>
                    <div className="p-field">
                        <label htmlFor="indicator_perc">Үзүүлэлтийн хувь</label>
                        <InputNumber
                            id="indicator_perc"
                            value={indicator.indicator_perc}
                            onChange={(e) => setIndicator({ ...indicator, indicator_perc: e.value })}
                            required
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="created_by">Үүсгэсэн</label>
                        <InputText
                            id="created_by"
                            value={indicator.created_by}
                            onChange={(e) => setIndicator({ ...indicator, created_by: e.target.value })}
                            required
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="created_date">Үүсгэсэн огноо</label>
                        <Calendar
                            id="created_date"
                            value={indicator.created_date ? new Date(indicator.created_date) : null}
                            onChange={(e) => setIndicator({ ...indicator, created_date: e.value })}
                            required
                            showIcon
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="last_modified_date">Сүүлд засварласан огноо</label>
                        <Calendar
                            id="last_modified_date"
                            value={indicator.last_modified_date ? new Date(indicator.last_modified_date) : null}
                            onChange={(e) => setIndicator({ ...indicator, last_modified_date: e.value })}
                            required
                            showIcon
                        />
                    </div>
                    <div className="p-field col-span-2">
                        <label htmlFor="file">Зураг</label>
                        <FileUpload
                            mode="basic"
                            name="file"
                            accept="image/*"
                            maxFileSize={10000000}
                            onSelect={handleFileUpload}
                            auto
                            chooseLabel="Зураг сонгох"
                        />
                    </div>
                    <div className="p-field col-span-2 flex justify-end gap-2">
                        <Button label="Хадгалах" type="submit" icon="pi pi-save" />
                        <Button
                            label="Болих"
                            type="button"
                            icon="pi pi-times"
                            onClick={() => router.push('/admin/indicator')}
                            severity="secondary"
                        />
                    </div>
                </form>
            </Card>
            <Toast ref={toast} />
        </div>
    );
} 