'use client';
import { useState, useRef } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { submitViolationReport } from '@/app/services/actions';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Toast } from 'primereact/toast';
import './styles.scss';

export default function ViolationPage({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");
    const toast = useRef(null);

    const breadMap = [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('footer.violation') },
    ];

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

    const [submitting, setSubmitting] = useState(false);

    const validateForm = () => {
        return Object.values(formData).every(value => value.trim() !== '');
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.current.show({
                severity: 'warn',
                summary: t('warning'),
                detail: lng === 'mn' ? 'Талбарыг бүрэн бөглөнө үү' : 'Please fill in all fields',
            });
            return;
        }

        setSubmitting(true);
        try {
            const result = await submitViolationReport(formData);

            if (result.success) {
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
                toast.current.show({
                    severity: 'error',
                    summary: t('error'),
                    detail:
                        result.error === 'validation'
                            ? (lng === 'mn' ? 'Талбарыг бүрэн бөглөнө үү' : 'Please fill in all fields')
                            : (lng === 'mn' ? 'Алдаа гарлаа' : 'Error occurred'),
                });
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: t('error'),
                detail: lng === 'mn' ? 'Алдаа гарлаа' : 'Error occurred',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="about_us_header">
                <div className="nso_page_header">
                    <div className="nso_container">
                        <div className="__header">
                            <span className="__page_name">
                                {t("footer.violation")}
                            </span>
                            <BreadCrumb model={breadMap} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="nso_statistic_category" style={{ background: 'white' }}>
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
                                    className="__input _message w-full"
                                    name="letter"
                                    value={formData.letter}
                                    onChange={handleInputChange}
                                    placeholder={t('contact.messageV')}
                                />
                            </div>
                            <div className="__submit" style={{marginTop: 0}}>
                                <input
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    value={submitting ? (lng === 'mn' ? 'Илгээж байна…' : 'Sending…') : t('send')}
                                    className="__submit_button"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toast ref={toast} position="top-right" baseZIndex={10000} />
        </>
    );
}