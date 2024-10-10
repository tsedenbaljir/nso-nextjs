"use client"
// components/DynamicForm.tsx
import { useState } from 'react';
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";

const DynamicForm = () => {
    const [formData, setFormData] = useState({
        contacts: [{ name: '', email: '' }],
    });

    const handleChange = (e, index) => {
        const { name, value } = e.target;
        const contacts = [...formData.contacts];
        contacts[index][name] = value;
        setFormData({ contacts });
    };

    const handleAddContact = () => {
        setFormData((prevFormData) => ({
            contacts: [...prevFormData.contacts, { name: '', email: '' }],
        }));
    };

    const handleRemoveContact = (index) => {
        const contacts = [...formData.contacts];
        contacts.splice(index, 1);
        setFormData({ contacts });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    return (
        <form onSubmit={handleSubmit} className="wi-full mx-auto p-4 ">
            {formData.contacts.map((contact, index) => (
                <div key={index} className="mb-4">
                    <div className="flex mb-2">
                        <div className="mr-4">
                            <FloatLabel>
                                <InputText
                                    id={`name-${index}`}
                                    value={contact.name}
                                    style={{
                                        border:"1px solid gray"
                                    }}
                                    onChange={(e) => handleChange(e, index)}
                                />
                                <label htmlFor="name">name</label>
                            </FloatLabel>
                        </div>
                        <div className="mr-4">
                            <FloatLabel>
                                <InputText
                                    id={`name-${index}`}
                                    value={contact.name}
                                    style={{
                                        border:"1px solid gray"
                                    }}
                                    onChange={(e) => handleChange(e, index)}
                                />
                                <label htmlFor="name">name</label>
                            </FloatLabel>
                        </div>
                        <div className="mr-4">
                            <FloatLabel>
                                <InputText
                                    id={`name-${index}`}
                                    value={contact.name}
                                    style={{
                                        border:"1px solid gray"
                                    }}
                                    onChange={(e) => handleChange(e, index)}
                                />
                                <label htmlFor="name">name</label>
                            </FloatLabel>
                        </div>
                        <div>
                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveContact(index)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-dark-7 shadow-2 hover:bg-dark-6 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Устгах
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={handleAddContact}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Нэмэх
            </button>
            <button
                type="submit"
                className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
                Хадгалах
            </button>
        </form>
    );
};

export default DynamicForm;
