export default function Statistic({ children }) {
    return (
        <>
            <div className="nso_statistic_section">
                <div className="nso_container">
                    <div className="__statistic_groups w-full">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
