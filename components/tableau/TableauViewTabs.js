"use client";

import { useEffect, useRef, useState } from "react";
import TableauVizEmbed from "./TableauVizEmbed";

/** Tableau path-аас ?:iid=... гэх мэт query-г цэвэрлэнэ */
function cleanViewPath(path) {
    if (!path) return "";
    return path.split("?")[0];
}

/**
 * Viewport-д орсон үед л Tableau embed ачаална.
 * Олон view нэгэн зэрэг mount хийхэд Generic алдаа гарахаас сэргийлнэ.
 */
function LazyTableauView({ path, title, height }) {
    const ref = useRef(null);
    const [active, setActive] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setActive(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "240px 0px", threshold: 0.01 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={ref} className="min-w-0">
            {/* {title ? (
                <h2 className="mb-3 text-base font-medium text-[var(--foreground)] sm:text-lg">
                    {title}
                </h2>
            ) : null} */}
            {active ? (
                <TableauVizEmbed viewPath={path} height={height} />
            ) : (
                <div
                    className="flex items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/40"
                    style={{ height }}
                >
                    Гүйлгэхэд ачаална...
                </div>
            )}
        </section>
    );
}

/**
 * Олон Tableau view-г нэг хуудсанд доош нь залгаж харуулна.
 * View бүрийг viewport-д ороход л ачаална (зэрэг ачаалбал Tableau Generic error гарна).
 */
export default function TableauViewTabs({ views, height = 900, className = "" }) {
    if (!views?.length) return null;

    return (
        <div className={`flex flex-col gap-8 ${className}`}>
            {views.map((view, i) => {
                const path = cleanViewPath(view.path);
                return (
                    <LazyTableauView
                        key={`${path}-${i}`}
                        path={path}
                        title={view.title}
                        height={height}
                    />
                );
            })}
        </div>
    );
}
