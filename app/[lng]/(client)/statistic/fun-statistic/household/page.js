"use client";

export default function Statistic({ params }) {

    return (
        <>
            <div className="nso_container">
                <div className="__detail_body" style={{ width: "100%" }}>
                    <div className="__stat_detail_tableau" style={{ backgroundColor: "white", width: "100%" }}>
                        <iframe src="https://funs.app.nso.mn" height="3200px"
                            style={{ border: "none", overflow: "hidden", backgroundColor: "white" }} frameBorder="0" width="100%">
                        </iframe>
                    </div>
                </div>
            </div>
        </>
    );
}
