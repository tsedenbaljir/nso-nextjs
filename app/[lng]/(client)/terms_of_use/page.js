"use client"
import Layout from '@/components/baseLayout';
import { useTranslation } from '@/app/i18n/client';

export default function TermsOfUse({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");

    return (
        <>
            <div className="nso_transparency mt-40">
                <div className="nso_container">
                    {/* Content Section */}
                        <div className="mx-auto bg-white rounded-lg shadow-md">
                            <div className="p-6 md:p-8">
                                <div className="container mx-auto px-4 mb-5">
                                    <h1 className="text-3xl md:text-4xl font-bold text-center">
                                        {lng === "mn" ? "www.1212.mn цахим хуудас, нээлттэй өгөгдлийг ашиглах нөхцөл" :"www.1212.mn website and open data terms of use"}
                                    </h1>
                                </div>
                                <div className='text-justify text-lg'>
                                    <ul className='list-disc'>
                                        <li>{lng === "mn" ? "ҮСХ-ны www.1212.mn цахим хуудаст байгаа статистикийн болон бусад мэдээллийг чөлөөтэй хуулбарлаж, хувилах, мөн түгээх боломжтой." : "www.1212.mn website, which is a part of the Mongolian Statistical Service, provides free access to statistical and other information. You can freely use, modify, and distribute this information."}</li>
                                    </ul>
                                    <ul className='list-disc'>
                                        <li>{lng === "mn" ? "Хэрэв Та www.1212.mn цахим хуудаснаас статистикийн мэдээллийг авч ашигласан болон цааш түгээсэн тохиолдолд (Эх сурвалж: Монгол Улсын Үндэсний статистикийн хороо) гэж заавал дурдах ёстойг анхаарна уу." : "If you use the statistical information from www.1212.mn website and distribute it further, you must cite the source as (Source: Mongolian Statistical Service) and acknowledge the Mongolian Statistical Service."}</li>
                                    </ul>
                                    <ul className='list-disc'>
                                        <li>{lng === "mn" ? "ҮСХ-ны статистикийн мэдээлэл, нээлттэй өгөгдлийг (OPEN DATA) програмчлалын интерфейс (API)-ээр дамжуулан авах боломжтой." : "The Mongolian Statistical Service provides free access to statistical and other information through its programmatic interface (API). You can freely use, modify, and distribute this information."}</li>
                                    </ul>
                                    <ul className='list-disc'>
                                        <li>{lng === "mn" ? "Аж ахуйн нэгж, байгууллага нь ҮСХ-ны нээлттэй өгөгдлийг (OPEN DATA) ашиглан өөрсдийн шинэ бүтээгдэхүүн, үйлчилгээг хөгжүүлэх боломжтой." : "Business entities and organizations can use the Mongolian Statistical Service's (OPEN DATA) information to develop new products and services."}</li>
                                    </ul>
                                    <ul className='list-disc'>
                                        <li>{lng === "mn" ? <>API ашиглан статистикийн мэдээллийн нэгдсэн санг <span className='badge  alert-info' style={{ color: '#ffffff', backgroundColor: '#00b96d', borderRadius: '5px', padding: '0 5px' }}>JSON</span> болон <span className='badge  alert-info' style={{ color: '#ffffff', backgroundColor: '#00a5f7', borderRadius: '5px', padding: '0 5px' }}>XML</span> форматаар дамжуулан авах боломжтой.</> : "You can access the combined data of statistical information in JSON and XML formats through the API."}</li>
                                    </ul>
                                    <ul className='list-disc'>
                                        <li>{lng === "mn" ? "ҮСХ-ны API-р авсан өгөгдлийг ашгийн болон ашгийн бус зорилгоор нээлттэй ашиглаж, тархааж болно.": "Data obtained through the NSO API can be openly used and distributed for both profit and non-profit purposes."}</li>
                                    </ul>
                                    <ul className='list-disc'>
                                        <li>{lng === "mn" ? "API хэрэглэгч нэг IP хаягаас 1 секунд тутамд 1-ээс дээш хүсэлт илгээхгүй байх нь зүйтэй. Нэг хүсэлтэд хамгийн ихдээ 100,000 утгын хариу илгээнэ. Хэрэв HTTP 403- гэсэн алдаа зааж байвал уг утга нь дээд хязгаараас хэтэрсэн байна гэсэн утгатай юм.":"API users should not send more than 1 request per second from a single IP address. A maximum of 100,000 values ​​are returned per request. If an HTTP 403 error is returned, this means that the value has exceeded the maximum limit."}</li>
                                    </ul>
                                    <ul class>
                                        <li>{lng === "mn"? "Таны ашиглаж буй API системд аюул хор учруулах бол таны хэрэглээг түдгэлзүүлэх болно.":"If the API you are using poses a threat to the system, your use will be suspended."}</li>
                                    </ul>
                                    <ul className='list-disc'>
                                        <li>{lng === "mn" ? "Та манай ашиглах нөхцөлийг зөрчсөн тохиолдолд таны хандах эрхийг түдгэлзүүлж Монгол Улсын холбогдох хуулийн дагуу шийдвэрлэнэ.":"If you violate our terms of use, your access rights will be suspended and action will be taken in accordance with applicable Mongolian law."}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        </>
    );
}
