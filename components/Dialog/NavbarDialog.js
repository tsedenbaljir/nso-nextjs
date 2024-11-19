"use client"
import React from 'react';
import { Modal } from 'antd';

export default function NavbarDialog({ visible, onClose, type, data }) {
    // Filter navitems based on navbarType
    const getFilteredItems = () => {
        const navData = data?.find(nav => nav.navbarType === type);
        return navData?.navitems?.filter(item => item.published) || [];
    };

    const handleLinkClick = (link) => {
        if (link.startsWith('http')) {
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
            title={getFilteredItems()[0]?.parent === 0 ? <div className="text-xl font-semibold border-b-2 border-gray-200 pb-4">Холбоосууд</div> : ""}
        >
            <div className="w-full flex flex-row flex-wrap gap-4 py-4">
                {getFilteredItems().filter(item => item.parent !== 0).map((item) => (
                    <div
                        key={item.id}
                        className="flex-[0_0_calc(24%-1rem)] cursor-pointer hover:underline font-semibold"
                        onClick={() => handleLinkClick(item.link)}
                    >
                        {item.name}
                    </div>
                ))}
            </div>
        </Modal>
    );
} 