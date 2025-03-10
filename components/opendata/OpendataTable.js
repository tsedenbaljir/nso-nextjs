"use client";
import { useState } from 'react';
import { useTranslation } from '@/app/i18n/client';

export default function OpendataTable({ params: { lng }, data, subData }) {
    const { t } = useTranslation(lng, "lng", "");

    if (subData) {
        return (
            <>
                {subData.map((itemData, i) => (
                    <div key={i}>
                        {i > 0 && (
                            <h5 className="__margin-top">{itemData[0].object}</h5>
                        )}
                        <table className="__opendata_table">
                            <thead>
                                <tr>
                                    <td width="20%">{t('opendata.dataName')}</td>
                                    <td width="35%">{t('opendata.description')}</td>
                                    <td width="15%">{t('opendata.dataType')}</td>
                                    <td>{t('opendata.addition')}</td>
                                </tr>
                            </thead>
                            <tbody>
                                {itemData.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <code className="__code __color_blue">
                                                {item.name}
                                            </code>
                                        </td>
                                        <td>{item.description}</td>
                                        <td>
                                            <code
                                                className={`__code ${item.dataType === 'string'
                                                        ? '__color_orange'
                                                        : item.dataType === 'integer'
                                                            ? '__color_green'
                                                            : ''
                                                    }`}
                                            >
                                                {item.dataType}
                                            </code>
                                        </td>
                                        <td dangerouslySetInnerHTML={{ __html: item.addition || '' }} />
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </>
        );
    }

    // Original table rendering for non-subData cases
    if (!data || data.length === 0) return null;

    return (
        <table className="__opendata_table">
            <thead>
                <tr>
                    {Object.keys(data[0]).map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {Object.values(row).map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
} 