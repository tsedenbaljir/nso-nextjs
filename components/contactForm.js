import React, { useState } from 'react';
import { notification, ConfigProvider } from 'antd';
import { submitContactForm } from '@/app/services/actions';

const ContactForm = () => {
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
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };
    const [loading, setLoading] = useState(false);
    notification.config({
      placement: 'topRight',
      top: 100, 
    });
    const handleSubmit = async () => {
      setLoading(true);
      if (!formData.letter.trim()) {
        notification.warning({
          message: 'Анхааруулга',
          description: 'Та захидлын хэсгийг заавал бөглөнө үү.',
        });
        return;
      }
      try {
        const result = await submitContactForm(formData);
    
        if (result.success) {
          notification.success({
            message: 'Амжилттай',
            description: 'Таны хүсэлтийг хүлээн авлаа.',
            duration: 2,
          });
    
          setTimeout(() => {
            setFormData({
              lastName: '',
              firstName: '',
              country: '',
              phoneNumber: '',
              city: '',
              district: '',
              khoroo: '',
              apartment: '',
              letter: '',
            });
          }, 1000); 
        } else {
          notification.error({
            message: 'Алдаа',
            description: result.error || 'Алдаа гарлаа',
            duration: 3,
          });
        }
    
      } catch (err) {
        console.error('Сүлжээний алдаа:', err);
        notification.error({
          message: 'Сүлжээний алдаа',
          description: 'Хүсэлт илгээхэд асуудал гарлаа. Та дахин оролдоно уу.',
          duration: 3,
        });
      } finally {
        setLoading(false);
      }
    };
    
  
return (
    <ConfigProvider
      theme={{ token: { colorPrimary: '#1677ff' } }}
    >
      <div className="__form">
        <h2 className="__form_title">Санал хүсэлт</h2>
        <div className="__input_form_group two-column">
          <input
            type="text"
            name="lastName"
            className="__input_form"
            placeholder="Овог"
            value={formData.lastName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="firstName"
            className="__input_form"
            placeholder="Нэр"
            value={formData.firstName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="country"
            className="__input_form"
            placeholder="Улс"
            value={formData.country}
            onChange={handleChange}
          />
          <input
            type="text"
            name="phoneNumber"
            className="__input_form"
            placeholder="Утасны дугаар"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <input
            type="text"
            name="city"
            className="__input_form"
            placeholder="Аймаг хот"
            value={formData.city}
            onChange={handleChange}
          />
          <input
            type="text"
            name="district"
            className="__input_form"
            placeholder="Сум дүүрэг"
            value={formData.district}
            onChange={handleChange}
          />
          <input
            type="text"
            name="khoroo"
            className="__input_form"
            placeholder="Хороо"
            value={formData.khoroo}
            onChange={handleChange}
          />
          <input
            type="text"
            name="apartment"
            className="__input_form"
            placeholder="Байр, гудамж"
            value={formData.apartment}
            onChange={handleChange}
          />
          <textarea
            name="letter"
            className="__input_form _message full-width"
            placeholder="Захидал бичих:"
            value={formData.letter}
            onChange={handleChange}
          />
        </div>
        <div className="__submit">
          <input
            type="button"
            className="__submit_button"
            value="Илгээх"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </ConfigProvider>
);
};

export default ContactForm;