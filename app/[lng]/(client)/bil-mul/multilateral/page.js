"use client"
import React, { useState } from 'react';
import Layout from '@/components/baseLayout';
import "@/components/styles/cooperation.scss";

export default function AboutUs({ params: { lng } }) {

    return (
        <Layout lng={lng}>
            <div className='nso_about_us'>
                <div className='nso_container'>
                    <div className="__statistic_groups" style={{ marginTop: 180 }}>
                        <div className="__top_text">
                            {lng === 'mn' ? "Олон талт хамтын ажиллагаа" : "Multilateral cooperation"}
                            <br />
                            <br />
                        </div>
                        <div className="nso_tab_content text-justify">
                            {lng === 'mn' ? <div>
                                <p>
                                    Монголын статистикийн албыг хөгжүүлэхэд НYБ, түүний төрөлжсөн
                                    байгууллагуудын хамтын ажиллагаа ихээхэн ач холбогдолтой
                                    байсан. НYБ-ын төрөлжсөн байгууллагуудтай Монгол улсын
                                    статистикийн тоо мэдээлэл гаргаж өгөх, аргачлал зөвлөмж авч
                                    ашиглах, мэдээлэл солилцох зэрэг хэмжээнд хамтран ажиллаж
                                    байв. <br /><br />НYБ-ын Хөгжлийн Хөтөлбөр (ХХ)-тэй 1970-71
                                    оноос хамтран ажиллаж 1970 оны сүүлчээр Монголд Тооцоолох төв
                                    байгуулах Засгийн газрын санал (запрос)-ыг илгээснээс хойш
                                    хамтын ажиллагаа илүү далайцтай хөгжсөн билээ. Монгол улсад
                                    Тооцоолон бодох төв байгуулах ажилд туслах 2 үе шаттай
                                    хэрэгжих МОН-71-507 төслийг НYБ-ын ХХ-өөс 1971 онд
                                    хэрэгжүүлсэн юм. Энэхүү төсөл амжилттай хэрэгжсэнээр Монгол
                                    улсад тооцоолох электрон машин ашиглах алхам хийж, мэдээлэл
                                    боловсруулах технологид дэвшил гаргаж, цаашдын хөгжлийн үндэс
                                    суурийг тавьсан. <br /><br />Монгол Улс зах зээлийн эдийн
                                    засгийн харилцаанд шилжиж эхэлсэн 1990 оноос статистикийн
                                    албаны гадаад харилцааны шинэ үе эхэлж, хоёр талт болон олон
                                    талт хамтын ажиллагааг идэвхтэйгээр хөгжүүлж, төсөл хөтөлбөр
                                    хэрэгжүүлж ирсэн байна. Статистикийн мэдээллийн үзүүлэлт,
                                    аргачлалыг олон улсын жишиг стандартад нийцүүлэх, үндэсний
                                    тооцооны системийг нэвтрүүлэх ажлыг үе шаттайгаар зохион
                                    байгуулж эхэлсэн. Хүн ам, нийгмийн статистикийн чиглэлээр
                                    төрөл бүрийн түүвэр судалгаа явуулах, статистикийн боловсон
                                    хүчний чадавхийг дээшлүүлэх зэрэгт НYБ-ын Хөгжлийн хөтөлбөр,
                                    Хүн амын сан, Хүүхдийн сан, Дэлхийн Банк, Азийн Хөгжлийн Банк,
                                    Олон Улсын Валютын Сан, Эдийн Засгийн хамтын ажиллагаа,
                                    хөгжлийн байгууллага болон Евростат зэрэг олон улсын
                                    байгууллагатай өргөн хүрээтэй хамтран ажиллаж байна. Yүний
                                    дотор амьжиргааны түвшний түүвэр судалгааг 1995 оноос, хүн
                                    амын нөхөн үржихүйн эрүүл мэндийн түүвэр судалгааг 1998 оноос
                                    тодорхой давтамжтайгаар явуулж ирлээ. Хүн ам, орон сууцны
                                    2000, 2010 оны тооллого, Цаг ашиглалт, Ажиллах хүчний түүвэр
                                    судалгааг олон улсын байгууллагын санхүүжилт, техникийн
                                    туслалцаатайгаар явуулж ирсэн. Түүнчлэн олон улсын
                                    байгууллагуудын санхүүгийн дэмжлэгтэйгээр мэргэжил дээшлүүлэх
                                    сургалт семинаруудад статистикийн төв, орон нутгийн
                                    байгууллагын олон арван хүнийг хамруулж, боловсон хүчнийхээ
                                    чадавхийг дээшлүүлж байна. <br /><br />Монгол Улс анх удаа
                                    2011 онд НҮБ-ын Статистикийн Комиссын гишүүний сонгуульд нэрээ
                                    дэвшүүлэн, энэ хүрээнд ГХЯ-тай хамтран ажиллаж, НҮБЭЗНЗ –ийн
                                    2011 оны 4-р сарын 27-ны өдрийн сэргээгдсэн хуралдааны үеэр
                                    Монгол Улс НҮБ-ын Статистикийн Комиссын жинхэнэ гишүүнээр
                                    сонгогдсон нь статистикийн салбарын төдийгүй улс орны хувьд
                                    онцлох үйл явдал болсон юм. <br /><br />ҮСХ нь НҮБСК-ын албан
                                    ёсны гишүүнийхээ хувьд олон улсын статистикийн хамтын
                                    нийгэмлэгийн өмнө тулгарч буй олон асуудлуудыг шийдвэрлэхэд
                                    илүү идэвхтэй, амжилттай оролцож, Байгалийн нөөцөд суурилсан
                                    эдийн засгийн статистикийн Улаанбаатар хотын бүлгийн гарын
                                    авлагыг НҮБ-ын СК-ын 49 чуулганаар батлуулсан.
                                    <br /><br />Төв, орон нутгийн статистикийн салбарын чадавхыг
                                    бэхжүүлэх ажлын хүрээнд олон талт хамтын ажиллагааг түлхүү
                                    ашиглаж байна. Үүнд: <br /><br />НҮБ-ын Статистикийн Хэлтэс
                                    болон НҮБ-ын Ази, Номхон Далайн Эдийн засаг, Нийгмийн
                                    Комисстой салбарын статистикийг боловсронгуй болгох,
                                    <br /><br />НҮБ-ын Ази, Номхон Далайн Статистикийн Институт
                                    /АНДОСИ/ болон Япон улсын ЖАЙКА байгууллагын дэмжлэгтэй
                                    статистикийн салбарын боловсон хүчнийг мэргэшүүлэх давтан
                                    сургах, <br /><br />Дэлхийн Банктай статистикийн системийн
                                    чадавхийг бэхжүүлэх төсөл, Ядуурлын тооцоолол зэрэг чиглэлээр
                                    хамтран ажиллаж байна. <br /><br />Түүнчлэн, ҮСХ-ы үйл
                                    ажиллагааг НҮБ-ын Хөгжлийн Хөтөлбөр, НҮБ-ын Хүн Амын Сан,
                                    НҮБ-ын Хүүхдийн Сан, Олон Улсын Хөдөлмөрийн Байгууллага, Азийн
                                    Хөгжлийн Банк, Олон Улсын Валютын Сан, НҮБ-ын Хүнс, Хөдөө Аж
                                    Ахуйн Байгууллага, НҮБ-ын Эмэгтэйчүүдийн байгууллага, НҮБ-ын
                                    Аж Үйлдвэрийн Хөгжлийн байгууллага Дэлхийн Эрүүл Мэндийн
                                    Байгууллага, “21-р Зууны Статистикийн Хөгжлийн Төлөөх Түншлэл”
                                    Консорциум ПАРИС21, Ази, Америк, Номхон Далайн орнуудын
                                    үндэсний тооллого, Статистикийн байгууллагын дарга нарын
                                    нийгэмлэг, Европын чөлөөт худалдааны нйигэмлэг, БНСУ-ын олон
                                    улсын хамтын ажиллагааны байгууллага, Япон Улсын олон улсын
                                    хамтын ажиллага байгууллга, “21-р Зууны Статистикийн Хөгжлийн
                                    Төлөөх Түншлэл” Консорциум ПАРИС21 зэрэг олон улсын
                                    байгууллагууд дэмжиж тодорхой чиглэлээр хамтран ажиллаж байна.
                                    <br /><br />
                                    2019 онд ҮСХ нь ПАРИС21 удирдах зөвлөлийн тэргүүн, НҮБ-ын
                                    статистикийн комиссын “Тогтвортой хөгжлийн зорилго-2030”
                                    хөтөлбөрийг хэрэгжүүлэх Дээд түвшний бүлгийн дарга, Ази,
                                    Америк, Номхон Далайн орнуудын үндэсний тооллого, Статистикийн
                                    байгууллагын дарга нарын нийгэмлэгийн 2018-2020 оны
                                    ерөнхийлөгч, НҮБ-ын Ази, Номхон Далайн орнуудын статистикийн
                                    институтын 2019-2022 оны гишүүнээр ажиллаж байна.
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
                                        The United Nations and its specialized agencies have played an
                                        important role to the development of Mongolian statistical
                                        system. NSO Mongolia collaborated with the UN and its
                                        specialized agencies to provide statistical data, obtain
                                        methodological advice and recommendations and exchange
                                        information. <br /><br />NSO started collaboration with the
                                        United Nations Development Program (UNDP) from 1970-1971. In
                                        the late 1970s the collaboration between NSO and the UNDP
                                        strengthened thanks to the proposal of the Government of
                                        Mongolia to the UNDP to establish a Computing Center in
                                        Mongolia. <br /><br />
                                        With the Mongolia’s transition to a market economy in 1990, a
                                        new phase of international relations of NSO has started. NSO
                                        has made great efforts to expand its bilateral and
                                        multilateral cooperation and implemented various programs and
                                        projects. NSO has taken stepwise measures to develop
                                        statistical indicators and methodologies in line with
                                        international standards and implementation of the System of
                                        National Accounts. It has been actively working with the UN
                                        and its specialized agencies namely UNSD, United Nations
                                        Development Program, United Nations Population Fund, United
                                        Nations Children's Fund, World Bank, Asian Development Bank,
                                        International Monetary Fund, Organization for Economic
                                        Co-operation and Development, Eurostat and a wide range of
                                        international organizations to conduct surveys in population
                                        and social statistics and strengthen human resource
                                        capacities. Afterward, we started to conduct living standard
                                        sample surveys since 1995, a sample survey of Reproductive
                                        Health since 1998, surveys have been conducted regularly. The
                                        population and housing census in 2000 and 2010, time usage and
                                        labour force sample survey were held with the sponsorship and
                                        technological support of international organizations.
                                        <br /><br />Mongolia has been participating in sessions of the
                                        UNSC as an observer. In recent years, NSO has become more
                                        active and engaged effectively in all events and activities
                                        organized by international statistical network. In 2011
                                        Mongolia was elected as one of 24 members of the UNSC that
                                        represents 194 UN member countries and that became an
                                        emphasizing event not only for statistical field but to the
                                        whole country. One of the significant accomplishments in the
                                        area of international relations was establishment of
                                        Ulaanbaatar city group of economies based on natural resources
                                        and organization of regular meetings. Furthermore, handbook of
                                        Ulaanbaatar city group economies based on natural resources,
                                        approved by the 49th session of UN Statistics Commission.
                                        <br /><br />Multilateral cooperation to strengthen the
                                        capacity of the central and provincial statistical fields.
                                        <br /><br />Of which: <br /><br />Cooperating with United
                                        Nations Statistical Institute for Asia and the Pacific (SIAP)
                                        and Japan International Cooperation Agency (JICA) to
                                        professionalize statistical field cadres.
                                        <br /><br />Cooperating with the World Bank to capacity of the
                                        statistical system and to estimate poverty.
                                        <br /><br />Furthermore, United Nations Development Program,
                                        United Nations Population Fund, United Nations Children’s
                                        Fund, International Labour Organization, Asian Development
                                        Bank, International Monetary Fund, United Nations Food and
                                        Agriculture Organization, United Nations Development Fund for
                                        Women, United Nations Industrial Development Organization,
                                        World Health Organization, World Bank, ANCSDAAP, EFTA, JICA,
                                        KOICA, Paris21 and a wide range of international organizations
                                        cooperating with NSO Mongolia in their related fields.
                                        <br /><br />
                                        In 2019, NSO Mongolia became a chair of the Board for the
                                        Partnership in Statistics for Development in the 21st Century
                                        (PARIS21), as one of the Co-chairs of the High-level Group for
                                        Partnership, Coordination and Capacity Building (HLG-PCCB), as
                                        a President of ANCSDAAP in 2018-2020 and as a member of
                                        Governing council of SIAP period 2019-2022.
                                    </p>
                                    <br />
                                    <div style="font-size: var(--font-size24)">
                                        NSO MONGOLIA IN THE INTERNATIONAL STATISTICS SYSTEM
                                    </div>
                                    <p>
                                        In the recent years, NSO representatives has been actively
                                        participated in the regional statistical commissions, both
                                        Asia and the Pacific and European statistical commissions,
                                        learning from the best practices and sharing its experience.
                                        Also, NSO Mongolia has been working in a high-level groups
                                        technical consultant teams. Directors and specialist of NSO
                                        Mongolia are working in the international statistical system,
                                        as a member of following the board, high-level and working
                                        groups:
                                    </p>
                                    <div style="padding-left: 20px">
                                        <p>Of which:</p>
                                        <ul>
                                            <li>
                                                Co-chair of the High-level Group for Partnership,
                                                Coordination, and capacity- Building for statistics for
                                                the 2030 Sustainable Development
                                            </li>
                                            <li>
                                                Chair of the Board for the Partnership in Statistics for
                                                Development in the 21st Century (PARIS21)
                                            </li>
                                            <li>
                                                President of the ANCSDAAP
                                            </li>
                                            <li>Member of the ISI</li>
                                            <li>
                                                Member of Governing council of SIAP period 2019-2022.
                                            </li>
                                            <li>
                                                Board member of UN ESCAP's Economic Statistics Regional
                                                Program
                                            </li>
                                            <li>
                                                Board member of UN-ESCAP's Population and Social
                                                Statistics
                                            </li>
                                            <li>
                                                Member of Regional Steering Group on CRVS
                                            </li>
                                            <li>
                                                Initiator of the " Ulaanbaatar city group of economies
                                                based on natural resources“
                                            </li>
                                            <li>
                                                Washington Group's member of the Disability Statistics
                                            </li>
                                            <li>
                                                Member of the Asia-Pacific Expert Group on
                                                Disaster-related Statistics
                                            </li>
                                            <li>
                                                Task team of UN ESCAP's business register
                                            </li>
                                            <li>
                                                Member of project group "The international strategy to
                                                improve agriculture and rural area statistics" initiated
                                                by United Nations Food and Agriculture Organization
                                            </li>
                                            <li>
                                                Member of the Working Group consisting of National
                                                Accounts Statistics units secretaries
                                            </li>
                                            <li>
                                                Member of the High-Level Group for the Modernisation of
                                                Official Statistics, UNECE
                                            </li>
                                            <li>
                                                Member of Advisory Group of the UNSD-DFID Project on SDG
                                                Monitoring
                                            </li>
                                        </ul>
                                    </div>
                                </div>}
                        </div>
                        <br />
                        <br />
                    </div>
                </div>
            </div>
        </Layout >
    );
}
