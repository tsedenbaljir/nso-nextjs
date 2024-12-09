"use client"
import React from 'react';
import { Modal } from 'antd';

export default function NavbarDialog({ visible, onClose, type, data }) {
    // Filter navitems based on 
    const getFilteredItems = () => {
        return data?.filter(item => 
            item.parent_id === type && 
            item.is_active === true) || [];
    };

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
            title={<div className="text-xl font-semibold border-b-2 border-gray-200 pb-4">Холбоосууд</div>}
        >
            <div className="w-full flex flex-row flex-wrap gap-4 py-4">
                {getFilteredItems().map((item) => (
                    <div
                        key={item.id}
                        className="flex-[0_0_calc(24%-1rem)] cursor-pointer hover:underline font-semibold"
                        onClick={() => handleLinkClick(item.link)}
                    >
                        {item.name_mn}
                    </div>
                ))}
            </div>
        </Modal>
    );
} 