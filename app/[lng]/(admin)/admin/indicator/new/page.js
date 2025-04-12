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
import InputItems from "./InputItems";
import SelectInput from "./SelectInput";

export default function CreateIndicator() {
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
        }
    }, [id]);

    const fetchIndicator = async (id) => {
        try {
            const response = await fetch(`/api/mainIndicators?id=${id}`);
            const result = await response.json();
            if (result.status) {
                setIndicator(result.data);
            }
        } catch (error) {
            console.error('Error fetching indicator:', error);
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
                method: id ? 'PUT' : 'POST',
                body: formData,
            });

            const result = await response.json();
            if (result.status) {
                router.push('/admin/indicator');
            } else {
                console.error('Error saving indicator:', result.message);
            }
        } catch (error) {
            console.error('Error saving indicator:', error);
        }
    };

    return (
        <div className="w-full px-2 h-full">
            <div className="items-center justify-between px-4 md:px-5 2xl:px-10">
                <h2 className="text-xl font-bold mb-4">
                    {id ? 'Үзүүлэлт засварлах' : 'Үзүүлэлт нэмэх'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
                    <div className="space-y-4 w-1/3">
                        <InputItems
                            name="Нэр"
                            data={indicator.name}
                            setData={(value) => setIndicator({ ...indicator, name: value })}
                        />
                        <InputItems
                            name="Англи нэр"
                            data={indicator.name_eng}
                            setData={(value) => setIndicator({ ...indicator, name_eng: value })}
                        />
                        <SelectInput
                            label="Төрөл"
                            data={categories.map((cat, index) => ({ id: cat.value, name: cat.label }))}
                            value={indicator.indicator_type}
                            setFields={(value) => setIndicator({ ...indicator, indicator_type: value })}
                        />
                    </div>

                    <div className="space-y-4 w-1/3">
                        <InputItems
                            name="Үзүүлэлт"
                            data={indicator.indicator}
                            setData={(value) => setIndicator({ ...indicator, indicator: value })}
                        />
                        <InputItems
                            name="Хэмжих төрөл"
                            data={indicator.measure_type}
                            setData={(value) => setIndicator({ ...indicator, measure_type: value })}
                        />
                        <InputItems
                            name="Мэдээлэл"
                            data={indicator.info}
                            setData={(value) => setIndicator({ ...indicator, info: value })}
                        />
                    </div>
                    <div className="space-y-4 w-1/4">
                        <InputItems
                            name="Англи мэдээлэл"
                            data={indicator.info_eng}
                            setData={(value) => setIndicator({ ...indicator, info_eng: value })}
                        />
                        <InputItems
                            name="Tableau"
                            data={indicator.tableau}
                            setData={(value) => setIndicator({ ...indicator, tableau: value })}
                        />
                        <InputItems
                            name="Англи Tableau"
                            data={indicator.tableau_eng}
                            setData={(value) => setIndicator({ ...indicator, tableau_eng: value })}
                        />
                    </div>
                    <div className="space-y-4 w-full flex gap-4">
                        <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
                            <input
                                type="checkbox"
                                id="published"
                                checked={indicator.published}
                                onChange={(e) => setIndicator({ ...indicator, published: e.target.checked })}
                                className="mr-2"
                            />
                            <label htmlFor="published" className="text-sm">Нийтлэх</label>
                        </div>

                        <InputItems
                            name="Үзүүлэлтийн хувь"
                            data={indicator.indicator_perc.toString()}
                            setData={(value) => setIndicator({ ...indicator, indicator_perc: parseFloat(value) || 0 })}
                        />

                        <InputItems
                            name="Үүсгэсэн"
                            data={indicator.created_by}
                            setData={(value) => setIndicator({ ...indicator, created_by: value })}
                        />
                    </div>

                    <div className="space-y-4 w-full">
                        <FileUpload
                            mode="basic"
                            name="file"
                            accept="image/*"
                            maxFileSize={10000000}
                            onSelect={handleFileUpload}
                            auto
                            style={{ width: 500 }}
                            chooseLabel="Зураг сонгох"
                            className="w-[500px]"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-4 w-full">
                        <div className="flex justify-end gap-2">
                            <Button label="Хадгалах" type="submit" icon="pi pi-save" />
                            <Button
                                label="Болих"
                                type="button"
                                icon="pi pi-times"
                                onClick={() => router.push('/admin/indicator')}
                                severity="secondary"
                            />
                        </div>
                    </div>
                </form>
            </div>
            <Toast ref={toast} />
        </div>
    );
} 