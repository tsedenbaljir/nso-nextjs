"use client"
import { useState } from 'react';
import InputItems from "@/components/admin/Edits/AddNew/InputItems";
import Items from "@/components/admin/Edits/MenusEdit/Items";

const Dashboard = () => {
    const [formData, setFormData] = useState({
        name: '',
        typeMenu: '',
        order: '',
        active: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form data submitted:', formData);
        // Here you can send data to the server or an API
    };

    const menus = [
        { id: 1, name: 'Бидний тухай', typeMenu: 'Silver', order: 1, active: 1 },
        { id: 2, name: 'Хамтын ажиллагаа', typeMenu: 'Silver', order: 2, active: 1 },
        { id: 3, name: 'Мэдээ мэдээлэл', typeMenu: 'Silver', order: 3, active: 1 },
        { id: 4, name: 'Хууль, эрх зүй', typeMenu: 'Silver', order: 4, active: 1 },
        { id: 5, name: 'Ил тод', typeMenu: 'Silver', order: 5, active: 1 },
        { id: 6, name: 'Толгойн цэс', typeMenu: 'Silver', order: 6, active: 1 },
        { id: 7, name: 'Хөлны цэс', typeMenu: 'Silver', order: 6, active: 1 },
    ];

    return (
            <div className="relative overflow-x-auto shadow-md h-full">
                {/* counts */}
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <main className='dark:bg-black h-full'>
                        <div className="flex flex-grow items-center justify-between px-4 py-5 shadow-2 md:px-5 2xl:px-10">
                            <div className="flex items-center justify-normal gap-2 2xsm:gap-4 lg:w-full lg:justify-between xl:w-auto xl:justify-normal">
                                <div className="nso_btn nso_btn_default margin_left_10 font-extrabold text-xl">
                                    Цэсний тохиргоо засах
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
                {/* menus edit */}
                <div className="items-center justify-between px-4 md:px-5 2xl:px-10">
                    <form onSubmit={handleSubmit}>
                        <div className='flex flex-wrap gap-3 mb-4'>
                            <InputItems index={1} name={"Нэр"} />
                            <InputItems index={2} name={"Англи нэр"} />
                        </div>
                        <div className='flex flex-wrap gap-3 mb-4'>
                            <InputItems index={3} name={"Эрэмбэ"} />
                            <InputItems index={4} name={"Төрөл"} />
                            <InputItems index={5} name={"Идвэхтэй"} />
                        </div>
                    </form>
                    <hr />
                    <Items menus={menus} />
                </div>
            </div >
    );
};

export default Dashboard;
