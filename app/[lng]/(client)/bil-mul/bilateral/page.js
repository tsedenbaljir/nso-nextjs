"use client"
import React, { useState } from 'react';
import Layout from '@/components/baseLayout';
import "@/components/styles/cooperation.scss";

export default function AboutUs({ params: { lng } }) {

    return (
        <>
            <div className='nso_about_us'>
                <div className='nso_container'>
                    <div className="__statistic_groups" style={{ marginTop: 180 }}>
                        <div className="__top_text">
                            {lng === 'mn' ? "Хоёр талт хамтын ажиллагаа" : "Bilateral cooperation"}
                            <br />
                            <br />
                        </div>
                        <div className="nso_tab_content text-justify">
                            {lng === 'mn' ? <div>
                                <p>
                                    Монгол Улсад бүртгэл, статистикийн алба 1924 онд үүссэнээр
                                    мэдээллийг боловсронгуй болгох, статистикийн мэргэжилтэй
                                    боловсон хүчнийг бэлтгэх шаардлага гарч ирсэн бөгөөд Зөвлөлт
                                    Холбоот Улс (ЗХУ) чухал үүрэг гүйцэтгэсэн билээ. Монгол Улсын
                                    Сангийн яамны дэргэд 1924 онд байгуулагдсан нягтлан бодохын
                                    курст ЗХУ-ын мэргэжилтнүүд багшилж, бүртгэлийн арга зүйг зааж
                                    байв. Энэ нь нягтлан бодох бүртгэлд дансны давхар бичилтийн
                                    хэлбэрийг нэвтрүүлэх чухал алхам болжээ. Зөвлөлтийн
                                    мэргэжилтэн, сургагч багш нар данс бүртгэлийн маягтыг 1926
                                    оноос боловсронгуй болгох, хүн ам, мал тооллогын дүнг гаргах,
                                    албан татварыг хувь тохируулан оногдуулах тооцоо хийх, бүртгэл
                                    статистикийг сурталчлахад туслаж байжээ. Бүртгэл статистикийн
                                    ажилтан нарыг 1926 оноос эхлэн Москва хотод явуулж сургаж
                                    эхэлсэн байна. Түүнчлэн ЗХУ-ын мэргэжилтнүүдийг дагалдуулан
                                    сургах явдал түгээмэл байжээ.
                                </p>
                                <br />
                                <p>
                                    БНМАУ-ын үед 1980-аад оны оноос эхлэн хоёр талт хамтын
                                    ажиллагааны хүрээнд Ардчилсан Герман, Чехословак, Югослав,
                                    Польш, Болгар, Венгер, Вьетнам, Куба, Румын улсын статистикийн
                                    байгууллагатай хамтран ажиллаж, туршлага судалж байсан.
                                </p>
                                <br />
                                <p>
                                    Зах зээл хөгжсөн орнуудын статистикийн албадтай 1990-ээд оноос
                                    эхлэн хамтран ажиллаж эхэлсэн. 2020 оны байдлаар Оросын
                                    Холбооны Улс, Бүгд Найрамдах Хятад Ард Улс, Бүгд Найрамдах
                                    Солонгос, Япон, Турк, Энэтхэг, Холбооны Бүгд Найрамдах Герман
                                    Улс, Австрали, Вьетнам, Бангладеш, Финланд, Унгар, Казахстан,
                                    Беларусь зэрэг 12 орны статистикийн байгууллагатай хамтын
                                    ажиллагааны гэрээ, санамж бичгийн хүрээнд ажиллаж байна.
                                </p>
                                <br />
                                <p>
                                    Монгол Улсын Үндэсний Статистикийн хороо нь Бүгд Найрамдах
                                    Беларусь Улсын Үндэсний статистикийн хороотой статистикийн
                                    салбарт хамтран ажиллах “Харилцан ойлголцлын хэлэлцээр”-ийг
                                    НҮБ-ын Статистикийн Комиссын ээлжит 51 дүгээр чуулганы үеэр
                                    2020 оны 3 дугаар байгуулсан.
                                </p>
                                <br />
                                <p>
                                    Хоёр талын хамтын ажиллагааны хүрээнд статистикийн албаны
                                    төлөөлөгчид харилцан айлчлаж, хамтын ажиллагааны хэлбэрээ
                                    тогтож, мэдээлэл солилцохын зэрэгцээ мэргэжилтнүүд харилцан
                                    туршлага судлах, богино хугацааны сургалт зохион байгуулах
                                    зэргээр хамтын ажиллагаа эрчимтэй явагдаж байна.
                                </p>
                                <br />
                                <div className='text-2xl'>
                                    Олон улсын статистикийн системд эзлэх байр суурь
                                </div>
                                <p>
                                    Сүүлийн жилүүдэд ҮСХ-ны төлөөлөгчид Ази, Номхон далайн бүс
                                    нутгийн Олон улсын статистикийн институт, Европын статистикийн
                                    системд идэвхтэй оролцож туршлага хуваалцан байр сууриа
                                    илэрхийлэхийн сацуу тодорхой чиглэлээр дээд хэмжээний бүлэг,
                                    техникийн зөвлөх багт орж ажилласан. ҮСХ-ны удирдлага,
                                    мэргэжилтнүүд олон улсын статистикийн системд дараах удирдах
                                    зөвлөлүүд, өндөр түвшний бүлэг, ажлын хэсгүүдэд гишүүнээр
                                    элсэн ажиллаж байна.
                                </p>
                                <br />
                                <div className='pl-5'>
                                    <p>Үүнд:</p>
                                    <ul className='list-disc pl-5'>
                                        <li>
                                            НҮБ-ын статистикийн комиссын “Тогтвортой хөгжлийн
                                            зорилго-2030” хөтөлбөрийг хэрэгжүүлэх Дээд түвшний бүлгийн
                                            дарга
                                        </li>
                                        <li>
                                            21-р зууны статистикийн хөгжлийн төлөөх түншлэл ПАРИС 21
                                            (PARIS 21) консорциумын Удирдах зөвлөлийн Тэргүүн
                                        </li>
                                        <li>
                                            Ази, Америк, Номхон Далайн орнуудын үндэсний тооллого,
                                            Статистикийн байгууллагын дарга нарын нийгэмлэгийн
                                            ерөнхийлөгч
                                        </li>
                                        <li>Олон улсын статистикийн институтын гишүүн</li>
                                        <li>
                                            НҮБ-ын АНДЭЗНК-ын Эдийн засгийн статистикийн бүсийн
                                            хөтөлбөрийн
                                        </li>
                                        <li>
                                            Удирдах зөвлөлийн гишүүн НҮБ-ын АНДЭЗНК-ын Хүн ам,
                                            нийгмийн статистикийн Удирдах зөвлөлийн гишүүн
                                        </li>
                                        <li>
                                            Иргэний бүртгэл ба шилжих хөдлөгөөний статистикийн Удирдах
                                            зөвлөлийн гишүүн
                                        </li>
                                        <li>
                                            "Байгалийн нөөцөд суурилсан эдийн засагтай улс орнуудын
                                            статистикийн Улаанбаатар хотын бүлэг”ийн санаачлагч,
                                            гишүүн
                                        </li>
                                        <li>
                                            Хөгжлийн бэрхшээлийн статистикийн Вашингтон группын гишүүн
                                        </li>
                                        <li>
                                            Ази, Номхон далайн орнуудын Гамшгийн статистикийн
                                            Шинжээчдийн бүлэг
                                        </li>
                                        <li>
                                            НҮБ-ын АНДЭЗНК-ын Бизнес регистрийн ажлын хэсгийн гишүүн
                                        </li>
                                        <li>
                                            НҮБ-ын ХХААБ-аас хэрэгжүүлж буй “Хөдөө аж ахуй, хөдөөгийн
                                            статистикийг сайжруулах олон улсын стратеги” сэдэвт
                                            төслийн бүлгийн гишүүн
                                        </li>
                                        <li>
                                            Үндэсний тооцооны Статистикийн нэгжүүдээс бүрдсэн Нарийн
                                            бичгийн дарга нарын ажлын хэсгийн гишүүн
                                        </li>
                                        <li>
                                            Албан ёсны статистикийн шинэчлэлийн өндөр түвшний бүлгийн
                                            гишүүн
                                        </li>
                                        <li>
                                            Тогтвортой хөгжлийн зорилгын үнэлгээний төслийн Зөвлөх
                                            багийн гишүүн
                                        </li>
                                    </ul>
                                </div>
                            </div> :
                                <div>
                                    <p>
                                        From the initial days of the People's Revolution in 1921, the
                                        Government of Mongolia acknowledged the importance of
                                        registration office for collection and organization of
                                        population, property and livestock census and implemented a
                                        series of measures to introduce registration and statistics.
                                        In the resolution of the first session of the Great Khural
                                        held on November 10th, 1924 it was stated that “Any state
                                        statistical and registration activities were important and
                                        crucial and it was necessary to establish registration unit
                                        responsible for that matter”. This resolution formalized and
                                        legalized the establishment of statistical and registration
                                        unit. Following the resolution on November 11th, 1924 the
                                        Registration Division was established with six staff under the
                                        Ministry of Internal Affairs. This laid down the foundation of
                                        the statistical institution in the country. From the first
                                        days of the foundation of modern statistical system the former
                                        USSR played a crucial role in preparation of the first
                                        professional specialists in statistics and in improvement of
                                        statistics. Beginning 1926 the statistical specialists were
                                        prepared in Moscow, Russia. Those, who were trained at
                                        universities in the former Soviet Union, were the first
                                        national statistical experts. Furthermore, the highly
                                        qualified statisticians, engineers and technical experts were
                                        invited from SU to provide expertise and train Mongolian
                                        staff.
                                    </p>
                                    <p>
                                        Beginning 1980s NSO Mongolia pursed effective bilateral
                                        cooperation and shared experience with statistical
                                        organizations of the Democratic Republic of Germany,
                                        Czechoslovakia, Yugoslavia, Poland, Bulgaria, Hungary,
                                        Vietnam, Cuba and Romania. It has started the collaboration
                                        with statistical institutions of market economies since 1990s.
                                    </p>
                                    <p>
                                        NSO Mongolia is working closely with the statistical
                                        institutions through the bilateral cooperation agreement and
                                        memorandum of understanding. As of 2020, there are 12
                                        countries with bilateral cooperation, which are Russia, Korea,
                                        Germany, Japan, Australia, China, Vietnam, Bangladesh,
                                        Finland, Hungary, Kazakhstan, Belarus.
                                    </p>
                                    <p>
                                        In 2020, NSO Mongolia had signed a memorandum of agreement
                                        with National Statistical Committee of the Republic of Belarus
                                        during the highest level international statistical event, the
                                        51st session of United Nations Statistical Commission.
                                    </p>
                                    <p>
                                        Within the scope of bilateral cooperation, the representatives
                                        of statistical offices commit official bilateral visits to
                                        establish the cooperation forms and exchange data,
                                        information; specialists organize short term courses to
                                        mutually learn the best practice.
                                    </p>
                                    <br />
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
