"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, notification } from 'antd';
import { useTranslation } from '@/app/i18n/client';
import { BreadCrumb } from 'primereact/breadcrumb';
import ContactForm from '@/components/contactForm';
import LoadingDiv from '@/components/Loading/Text/Index';
import '@/components/styles/contact-us.scss';

export default function Contact({ params: { lng } }) {
    const [loading, setLoading] = useState(true);
    const [contactData, setContactData] = useState(null);
    const [webpageData, setWebpageData] = useState(null);
    const [contactDataProvince, setContactDataProvince] = useState(null);

    const { t } = useTranslation(lng, "lng", "");

    const breadMap = [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('footer.contact') },
    ];
    const options = {
      q1: {
        "Өдөр бүр": 1,
        "7 хоног бүр": 2,
        "Сар бүр": 3,
        "Хааяа, шаардлагатай үед": 4
      },
      q2: {
        "www.1212.mn": 1,
        "Сошиал сувгууд": 2,
        "Телевизийн сувгууд": 3,
        "Сонин, хэвлэл": 4,
        "Мэдээллийн сайтууд": 5,
        "Лавлах утас 19001212, 70141212": 6
      },
      q3: {
        "Бодлого боловсруулах, хяналт тавих": 1,
        "Хууль эрх зүйн бэлтгэл": 2,
        "Бизнесийн шийдвэр гаргах": 3,
        "Ерөнхий мэдээлэлтэй болох": 4,
        "Зах зээлийн анализ хийх": 5,
        "Хэвлэл, медиад ашиглах": 6,
        "Судалгаа, шинжилгээ хийх": 7,
        "Гэрээ, хэлэлцээр хийх": 8,
        "Мэдээлэл дахин түгээх": 9,
        "Эдийн засгийн загвар, таамаглал": 10
      },
      q5: {
        "Хүндрэлгүй": 1,
        "Хэт ерөнхий, задаргаа муу": 2,
        "Ойлгомжгүй, зааваргүй": 3,
        "Хугацааны хоцрогдолтой": 4,
        "Нарийвчилсан мэдээлэл авахад хүндрэлтэй": 5
      }
    };

    const [formData, setFormData] = useState({
      q1: '',
      q2: '',
      q3: [],
      q4: {}, // { 0: 3, 1: 2, ... }
      q5: ''
    });

    const handleChange = (question, value) => {
      setFormData(prev => ({ ...prev, [question]: value }));
    };

    const handleCheckboxChange = (value) => {
      setFormData(prev => {
        const current = new Set(prev.q3);
        if (current.has(value)) {
          current.delete(value);
        } else {
          current.add(value);
        }
        return { ...prev, q3: [...current] };
      });
    };

    const handleQ4Change = (index, score) => {
      setFormData(prev => ({
        ...prev,
        q4: { ...prev.q4, [index]: score }
      }));
    };
    const openNotification = (msg) => {
      notification.open({
        message: msg,
      });
    };

    const handleSubmit = async (e) => {
      const encodeFormData = (data) => {
        return {
          q1: options.q1[data.q1] || 0,
          q2: options.q2[data.q2] || 0,
          q3: data.q3.map((item) => options.q3[item] || 0),
          q4: data.q4, // аль хэдийн кодлогдсон (1-5, 0)
          q5: options.q5[data.q5] || 0
        };
      };

      e.preventDefault();
      try {
        const encoded = encodeFormData(formData);
        await axios.post('/api/survey', encoded);
          
        notification.success({
          message: 'Амжилттай илгээгдлээ!',
          placement: 'topRight',  // хүсвэл байрлалаа өөрчлөх боломжтой
          duration: 3,           // хэдэн секундын дараа алга болох хугацаа
        });
      } catch (err) {
        notification.error({
          message: 'Алдаа гарлаа. Та дахин оролдоно уу.',
          description: err.message || '',
          placement: 'topRight',
          duration: 5,
        });
      }
    };


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch webpage content
                const webpageResponse = await axios.get('/api/webpage', {
                    params: {
                        slug: 'contact',
                        language: lng.toUpperCase()
                    }
                });
                if (webpageResponse.data) {
                    setWebpageData(webpageResponse.data);
                }

                // Existing contact phones fetch
                const contactResponse = await axios.get('https://gateway.1212.mn/services/1212/api/public/contents', {
                    params: {
                        'slug.equals': 'contact-phones',
                        'language.equals': lng.toUpperCase()
                    }
                });
                if (contactResponse.data && contactResponse.data.length > 0) {
                    setContactData(contactResponse.data[0]);
                }

                // Existing province data fetch
                const provinceResponse = await axios.get('https://gateway.1212.mn/services/1212/api/public/contents', {
                    params: {
                        'slug.equals': 'Contact-province',
                        'language.equals': lng.toUpperCase()
                    }
                });
                if (provinceResponse.data && provinceResponse.data.length > 0) {
                    setContactDataProvince(provinceResponse.data[0]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [lng]);

    const items = [
        {
            key: '1',
            label: <span className="font-bold">{lng === "mn" ? 'Хаяг байршил' : 'Address'}</span>,
            className: 'contact_tab_item',
            children: (
                <div style={{ width: '100%' }}>
                    {loading ? (
                        <div className="text-center py-4"><LoadingDiv /></div>
                    ) : (
                        <>
                            <div className="__map w-full" style={{ width: '100%' }}>
                                <iframe
                                    height="450"
                                    className="w-full border-0"
                                    allowFullScreen=""
                                    loading="lazy"
                                    style={{ width: '100%' }}
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2673.8775473613423!2d106.9199552156117!3d47.91940677430989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d9692412b294ed1%3A0x2573645c0869e276!2z0JfQsNGB0LPQuNC50L0g0LPQsNC30YDRi9C9IElJSSDQsdCw0LnRgCwg0KPQu9Cw0LDQvdCx0LDQsNGC0LDRgCAxNDIwMA!5e0!3m2!1smn!2smn!4v1634715651828!5m2!1smn!2smn">
                                </iframe>
                            </div>
                            {webpageData && (
                                <div dangerouslySetInnerHTML={{ __html: webpageData.body }} />
                            )}
                            <ContactForm isMn={lng === "mn"} />
                        </>
                    )}
                </div>
            ),
        },
        {
            key: '2',
            label: <span className="font-bold">{lng === "mn" ? 'Утасны жагсаалт' : 'Phone List'}</span>,
            className: 'contact_tab_item',
            children: (
                <div className="contact_tab_item">
                    {loading ? (
                        <div className="text-center py-4"><LoadingDiv /></div>
                    ) : (
                        contactData && (
                            <div dangerouslySetInnerHTML={{ __html: contactData.body }} />
                        )
                    )}
                </div>
            ),
        },
        {
            key: '3',
            label: <span className="font-bold">{lng === "mn" ? 'Орон нутаг' : 'Province'}</span>,
            className: 'contact_tab_item',
            children: (
                <div className="contact_tab_item">
                    {loading ? (
                        <div className="text-center py-4"><LoadingDiv /></div>
                    ) : (
                        contactDataProvince && (
                            <div dangerouslySetInnerHTML={{ __html: contactDataProvince.body }} />
                        )
                    )}
                </div>
            ),
        },
        {
            key: '4',
            label: <span className="font-bold">{lng === "mn" ? 'Сэтгэл ханамжийн судалгаа' : 'Survey'}</span>,
            className: 'contact_tab_item',
            children: (
              <div className="contact_tab_item space-y-6 py-4">
                {loading ? (
                  <div className="text-center py-4"><LoadingDiv /></div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto text-sm">
                  {/* Асуулт 1 */}
                  <div>
                    <p className="font-semibold">1. Та статистикийн мэдээллийг ямар давтамжтай ашигладаг вэ?</p>
                    {["Өдөр бүр", "7 хоног бүр", "Сар бүр", "Хааяа, шаардлагатай үед"].map((option, idx) => (
                      <label key={idx} className="block pl-4">
                        <input
                          type="radio"
                          name="q1"
                          value={option}
                          checked={formData.q1 === option}
                          onChange={(e) => handleChange("q1", e.target.value)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                
                  {/* Асуулт 2 */}
                  <div>
                    <p className="font-semibold">2. Та мэдээллийг ямар эх сурвалжаас авдаг вэ?</p>
                    {["www.1212.mn", "Сошиал сувгууд", "Телевизийн сувгууд", "Сонин, хэвлэл", "Мэдээллийн сайтууд", "Лавлах утас 19001212, 70141212"].map((option, idx) => (
                      <label key={idx} className="block pl-4">
                        <input
                          type="radio"
                          name="q2"
                          value={option}
                          checked={formData.q2 === option}
                          onChange={(e) => handleChange("q2", e.target.value)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                
                  {/* Асуулт 3 */}
                  <div>
                    <p className="font-semibold">3. Та ҮСХ-ны мэдээллийг ямар зорилгоор ашигладаг вэ?</p>
                    {[
                      "Бодлого боловсруулах, хяналт тавих",
                      "Хууль эрх зүйн бэлтгэл",
                      "Бизнесийн шийдвэр гаргах",
                      "Ерөнхий мэдээлэлтэй болох",
                      "Зах зээлийн анализ хийх",
                      "Хэвлэл, медиад ашиглах",
                      "Судалгаа, шинжилгээ хийх",
                      "Гэрээ, хэлэлцээр хийх",
                      "Мэдээлэл дахин түгээх",
                      "Эдийн засгийн загвар, таамаглал"
                    ].map((option, idx) => (
                      <label key={idx} className="block pl-4">
                        <input
                          type="checkbox"
                          name="q3"
                          value={option}
                          checked={formData.q3.includes(option)}
                          onChange={() => handleCheckboxChange(option)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                
                  {/* Асуулт 4 */}
                  <div>
                    <p className="font-semibold">4. Та статистикийн мэдээллийн чанарт үнэлгээ өгнө үү.</p>
                    <table className="w-full border mt-2 text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border px-2 py-1">Үзүүлэлт</th>
                          {["Маш сайн", "Сайн", "Дунд", "Муу", "Маш муу", "Мэдэхгүй"].map((label, idx) => (
                            <th className="border px-2 py-1" key={idx}>{label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          "Мэдээллийн шуурхай байдал",
                          "Бүрэн гүйцэт байдал",
                          "Харьцуулах боломж",
                          "Ил тод байдал",
                          "Ойлгомжтой байдал",
                          "Бодитой байдал"
                        ].map((label, i) => (
                          <tr key={i}>
                            <td className="border px-2 py-1">{label}</td>
                            {["1", "2", "3", "4", "5", "0"].map((val, j) => (
                              <td className="border px-2 py-1 text-center" key={j}>
                                <input
                                  type="radio"
                                  name={`q4-${i}`}
                                  value={val}
                                  checked={formData.q4[i] === val}
                                  onChange={() => handleQ4Change(i, val)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                    
                  {/* Асуулт 5 */}
                  <div>
                    <p className="font-semibold">5. Статистикийн мэдээлэл авахад ямар хүндрэл байдаг вэ?</p>
                    {[
                      "Хүндрэлгүй",
                      "Хэт ерөнхий, задаргаа муу",
                      "Ойлгомжгүй, зааваргүй",
                      "Хугацааны хоцрогдолтой",
                      "Нарийвчилсан мэдээлэл авахад хүндрэлтэй"
                    ].map((option, idx) => (
                      <label key={idx} className="block pl-4">
                        <input
                          type="radio"
                          name="q5"
                          value={option}
                          checked={formData.q5 === option}
                          onChange={(e) => handleChange("q5", e.target.value)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                
                  {/* Илгээх товч */}
                  <div className="text-center pt-6">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                      Илгээх
                    </button>
                  </div>
                </form>
                )}
              </div>
            )
        },
    ];

    return (
        <>
            <div className='nso_statistic_section'>
                <div className="nso_page_header">
                    <div className="nso_container">
                        <div className="__header">
                            <span className="__page_name">
                                {t("footer.contact")}
                            </span>
                            <BreadCrumb model={breadMap} />
                        </div>
                    </div>
                </div>
                <div className="nso_statistic_category" style={{ background: "var(--surface-a)" }}>
                    <div className="nso_container">
                        <Tabs
                            defaultActiveKey="1"
                            items={items}
                            className="contact_tab w-full"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
