"use client"
import { useState } from 'react';
import Editor from '@/components/admin/Editor/editor'
import InputItems from "@/components/admin/Edits/AddNew/InputItems";
import Upload from "@/components/admin/Edits/UploadImages/Upload";
import SelectInput from "@/components/admin/Edits/Select/SelectInput";

import AdminLayout from '@/components/admin/layouts/AdminLayout';

const Dashboard = () => {
    const [body, setBody] = useState([]);
    const [image, setImage] = useState([]);
    const [type, setType] = useState(1);
    const [lng, setLng] = useState(1);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form data submitted:', formData, body);
    };

    return (
        <AdminLayout>
            <div className="relative overflow-x-auto shadow-md h-full mb-20">
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <main className='dark:bg-black h-full'>
                        <div className="flex flex-grow items-center justify-between px-4 py-5 shadow-2 md:px-5 2xl:px-10">
                            <div className="flex items-center justify-normal gap-2 2xsm:gap-4 lg:w-full lg:justify-between xl:w-auto xl:justify-normal">
                                <div className="nso_btn nso_btn_default margin_left_10 font-extrabold text-xl">
                                    Мэдээ нэмэх
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
                <div className="items-center justify-between px-4 md:px-5 2xl:px-10">
                    <div className='flex flex-wrap gap-3 mb-4'>
                        <SelectInput setFields={setType} data={[{ id: 1, name: "Шинэ мэдээ" }, { id: 2, name: "Медиа мэдээ" }]} />
                        <SelectInput setFields={setLng} data={[{ id: 1, name: "MN" }, { id: 2, name: "EN" }]} />
                    </div>
                    <div className='flex flex-wrap gap-3 mb-4'>
                        <InputItems name={"Гарчиг"} />
                    </div>
                    <div className='flex flex-wrap gap-3 mb-4'>
                        <Upload name={"Нүүр зураг"} setImage={setImage} />
                    </div>
                    {/* Editor */}
                    <Editor setBody={setBody} />
                    {/* Active */}
                    <div className='flex flex-wrap gap-3 mb-4'>
                        <InputItems index={3} name={"Эрэмбэ"} />
                    </div>
                    <div className='float-right'>
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
        </AdminLayout>
    );
};

export default Dashboard;
