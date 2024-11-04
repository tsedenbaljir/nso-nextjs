import React from 'react';
import { useRouter } from "next/navigation";

export default function Tr({ item, lng, index }) {
    const router = useRouter();
    // Create a Date object once and reuse
    const publishedDate = new Date(item.published_date);
    const formattedDate = lng === "mn"
        ? `${publishedDate.getMonth() + 1} сарын ${publishedDate.getDate()}`
        : new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(publishedDate);
    const formattedTime = `${publishedDate.getHours()}:${publishedDate.getMinutes().toString().padStart(2, '0')}`;

    return (<tr key={index}>
        <td>{item.slug}</td>
        <td>
            {item.body !== "<p></p>" ? (
                <span
                    className="cursor-pointer hover:text-blue-400 hover:underline"
                    onClick={() => router.push(`/dissemination/${item.id}`)}
                >
                    {item.name}
                </span>
            ) : (
                item.name
            )}
            <div className="__table_spec">
                <span>{item.published_date.substr(0, 10)}</span>
                {item.body === "<p></p>" && (
                    <span className="__table_views">
                        {lng === "mn" ? 'Хугацаа болоогүй' : 'Soon'}
                    </span>
                )}
            </div>
        </td>
        <td>{formattedDate}</td>
        <td>{formattedTime}</td>
    </tr>
    );
}
