"use client"
import React from 'react';
import { Modal } from 'antd';
import { useTranslation } from '@/app/i18n/client'

export default function NavbarDialog({ visible, onClose, data, lng }) {
    const { t } = useTranslation(lng, "lng", "");
    const handleLinkClick = (link) => {
        if (!link) return;

        if (typeof link === 'string' && link.startsWith('http')) {
            window.open(link, '_blank');
        } else {
            window.location.href = link;
        }
    };

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={"70%"}
            zIndex={10000}
            title={<div className="text-xl font-semibold border-b-2 border-gray-200 pb-4">{t('footer.links')}</div>}
        >
            <div className="w-full flex flex-row flex-wrap gap-4 py-4">
                {data?.map((item) => {
                    if (item.link) {
                        return (
                            <div
                                key={item.id}
                                className="flex-[0_0_calc(24%-1rem)] cursor-pointer hover:underline font-semibold"
                                onClick={() => handleLinkClick(item.link)}
                            >
                                {item.displayName}
                            </div>
                        )
                    } else {
                        return <div
                            key={item.id}
                            className="flex-[0_0_calc(24%-1rem)] cursor-pointer text-blue-500 font-semibold"
                        >
                            {item.displayName}
                        </div>
                    }
                })}
            </div>
        </Modal>
    );
} 