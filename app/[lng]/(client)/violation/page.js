'use client';
import { useState, useRef } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { Toast } from 'primereact/toast';
import './styles.scss';

export default function ViolationPage({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");
    const toast = useRef(null);
    const [formData, setFormData] = useState({
        lastName: '',
        firstName: '',
        country: '',
        phoneNumber: '',
        city: '',
        district: '',
        khoroo: '',
        apartment: '',
        letter: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getEmailHtml = () => {
        return `
            <table>
                <tr><th>Газар, нэгж</th><td>${formData.lastName}</td></tr>
                <tr><th>Албан тушаал</th><td>${formData.firstName}</td></tr>
                <tr><th>Овог нэр</th><td>${formData.country}</td></tr>
                <tr><th>Зөрчлийн давтамж</th><td>${formData.phoneNumber}</td></tr>
                <tr><th>Зөрчлийг мэдсэн суваг</th><td>${formData.city}</td></tr>
                <tr><th>Зөрчлийг мэдээлсэн суваг</th><td>${formData.district}</td></tr>
                <tr><th>Шууд удирдах ажилтандаа мэдэгдсэн эсэх</th><td>${formData.khoroo}</td></tr>
                <tr><th>Нэмэлт мэдээлэл</th><td>${formData.apartment}</td></tr>
                <tr><th>Зөрчил</th><td>${formData.letter}</td></tr>
            </table>
        `;
    };

    const validateForm = () => {
        return Object.values(formData).every(value => value.trim() !== '');
    };

    const handleSubmit = async () => {
        try {
            if (!validateForm()) {
                toast.current.show({
                    severity: 'warn',
                    summary: t('warning'),
                    detail: lng === 'mn' ? 'Талбарыг бүрэн бөглөнө үү' : 'Please fill in all fields',
                });
                return;
            }

            const emailData = {
                to: 'webmaster@nso.mn',
                subject: 'Violation Report',
                text: 'Violation Report Submission',
                html: getEmailHtml()
            };

            const response = await fetch('https://smtp.app.nso.mn/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            if (response.ok) {
                toast.current.show({
                    severity: 'success',
                    summary: t('success'),
                    detail: lng === 'mn' ? 'Амжилттай' : 'Success',
                });
                setFormData({
                    lastName: '',
                    firstName: '',
                    country: '',
                    phoneNumber: '',
                    city: '',
                    district: '',
                    khoroo: '',
                    apartment: '',
                    letter: ''
                });
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: t('error'),
                detail: lng === 'mn' ? 'Алдаа гарлаа' : 'Error occurred',
            });
        }
    };

    return (
        <>
            <div className="nso_statistic_section mt-10">
                <div className="nso_statistic_category">
                    <div className="nso_container">
                        <div className="__contact_form">
                            <h3>{lng === 'mn' ? 'Зөрчил мэдээлэх' : 'Send violation'}</h3>
                            <div className="__form">
                                <div className="__input_group">
                                    <input
                                        className="__input"
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder={t('contact.lastNameV')}
                                    />
                                    <input
                                        className="__input"
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder={t('contact.firstNameV')}
                                    />
                                    <input
                                        className="__input"
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        placeholder={t('contact.countryV')}
                                    />
                                    <input
                                        className="__input"
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder={t('contact.phoneNumberV')}
                                    />
                                    <input
                                        className="__input"
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder={t('contact.cityV')}
                                    />
                                    <input
                                        className="__input"
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        placeholder={t('contact.districtV')}
                                    />
                                    <input
                                        className="__input"
                                        type="text"
                                        name="khoroo"
                                        value={formData.khoroo}
                                        onChange={handleInputChange}
                                        placeholder={t('contact.khorooV')}
                                    />
                                    <input
                                        className="__input"
                                        type="text"
                                        name="apartment"
                                        value={formData.apartment}
                                        onChange={handleInputChange}
                                        placeholder={t('contact.apartmentV')}
                                    />
                                    <textarea
                                        className="__input _message"
                                        name="letter"
                                        value={formData.letter}
                                        onChange={handleInputChange}
                                        placeholder={t('contact.messageV')}
                                    />
                                </div>
                                <div className="__submit">
                                    <input
                                        type="button"
                                        onClick={handleSubmit}
                                        value={t('send')}
                                        className="__submit_button"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Toast ref={toast} position="top-right" baseZIndex={10000} />
            </div>
        </>
    );
}