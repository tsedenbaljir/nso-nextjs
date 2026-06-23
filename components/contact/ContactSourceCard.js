"use client";

import { useTranslation } from "@/app/i18n/client";

const SOURCE_CONFIG = {
    contactSource: { tel: "51261530", email: "batsuuri@nso.mn" },
    aboutUsSource: { tel: "70141212", email: "tungalag_p@nso.mn" },
    lawsSource: { tel: "51263968", email: "bolorzul@nso.mn" },
    transparencySource: { tel: "11321433", email: "Munkh-och@nso.mn" },
};

export default function ContactSourceCard({ lng, sourceKey = "contactSource" }) {
    const { t } = useTranslation(lng, "lng", "");
    const { tel, email } = SOURCE_CONFIG[sourceKey];

    return (
        <div className="contact_source">
            <div className="contact_source__header">
                <i className="pi pi-info-circle" aria-hidden="true" />
                <span>{t(`${sourceKey}.title`)}</span>
            </div>
            <ul className="contact_source__list">
                <li>
                    <i className="pi pi-user" aria-hidden="true" />
                    <span>{t(`${sourceKey}.contact`)}</span>
                </li>
                <li>
                    <i className="pi pi-phone" aria-hidden="true" />
                    <a href={`tel:${tel}`}>{t(`${sourceKey}.phone`)}</a>
                </li>
                <li>
                    <i className="pi pi-map-marker" aria-hidden="true" />
                    <span>{t(`${sourceKey}.room`)}</span>
                </li>
                <li>
                    <i className="pi pi-envelope" aria-hidden="true" />
                    <a href={`mailto:${email}`}>{email}</a>
                </li>
            </ul>
        </div>
    );
}
