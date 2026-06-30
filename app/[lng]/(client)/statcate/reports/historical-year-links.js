"use client";

import yearbookLinks from "@/lib/historical-yearbook-links.json";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

export default function HistoricalYearLinks({ subsector, lng }) {
    const yearItems = yearbookLinks[subsector] ?? [];

    if (!yearItems.length) {
        return (
            <div className="py-6 text-sm text-gray-500">
                {lng === "mn" ? "Мэдээлэл олдсонгүй" : "No data found"}
            </div>
        );
    }

    const openYearbook = (file) => {
        window.open(resolveMediaUrl(`/uploads/${file}`), "_blank", "noopener,noreferrer");
    };

    return (
        <div className="bg-white py-4">
            <br />
            <div className="flex flex-wrap gap-2">
                {yearItems.map(({ year, file }) => (
                    <button
                        key={year}
                        type="button"
                        onClick={() => openYearbook(file)}
                        className="w-20 h-10 shrink-0 flex items-center justify-center rounded-full border border-gray-300 bg-white text-base font-semibold text-gray-900 transition-colors hover:border-[#005baa] hover:bg-blue-50 hover:text-[#005baa] cursor-pointer"
                    >
                        {year}
                    </button>
                ))}
            </div>
            <br />
            <br />
            <br />
            <br />
        </div>
    );
}
