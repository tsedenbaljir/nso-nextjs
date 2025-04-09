"use client";

export default function Statistic({ children }) {
    return (
        <>
            <div className="nso_statistic_section">
                <div className="nso_statistic_news">
                    <div className="nso_container">
                        <div className="__statistic_groups w-full">
                            <img src="/images/disimg.jpg" width="100%" />
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
