"use client";

import { useState } from "react";
import TableauPublicEmbed from "./TableauPublicEmbed";

/**
 * Олон Tableau view-г таб хэлбэрээр сольж харуулна.
 * views: [{ path: "/views/xxx/sheet0", title?: "Нэр" }]
 */
export default function TableauViewTabs({ views, height = 900, className = "" }) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!views?.length) return null;

    const active = views[Math.min(activeIndex, views.length - 1)];

    return (
        <div className={className}>
            {views.length > 1 && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {views.map((view, i) => {
                        const isActive = i === activeIndex;
                        return (
                            <button
                                key={`${view.path}-${i}`}
                                type="button"
                                onClick={() => setActiveIndex(i)}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${
                                    isActive
                                        ? "bg-slate-800 text-white shadow-sm"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
                                }`}
                            >
                                {view.title || `Самбар ${i + 1}`}
                            </button>
                        );
                    })}
                </div>
            )}
            {/* key — таб солиход embed-ийг дахин ачаална (trusted ticket нэг удаагийн) */}
            <TableauPublicEmbed key={active.path} viewPath={active.path} height={height} />
        </div>
    );
}
