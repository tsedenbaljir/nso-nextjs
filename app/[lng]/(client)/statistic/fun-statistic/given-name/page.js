// export default function Statistic() {
//   return (
//     <>
//       <div className="nso_container">
//         <div className="__detail_body" style={{ width: "100%" }}>
//           <div
//             className="__stat_detail_tableau"
//             style={{ backgroundColor: "white", width: "100%" }}
//           >
//             <iframe
//               src="https://www2.1212.mn/sonirkholtoi/GivenName_new/"
//               height="1200px"
//               frameBorder="0"
//               width="100%"
//             ></iframe>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import Link from "next/link";

export default function Statistic({ params }) {
    return (
        <>
            <div className="nso_container">
                <div className="__detail_body" style={{ width: "100%" }}>
                    <div
                        className="__stat_detail_tableau"
                        style={{
                            backgroundColor: "white",
                            width: "100%",
                            minHeight: "400px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "24px",
                            boxSizing: "border-box",
                        }}
                    >
                        <p style={{ marginBottom: "16px", textAlign: "center" }}>
                            Энэ хуудас засвартай байна.
                        </p>

                        <Link
                            href="https://www.1212.mn/mn/statistic/fun-statistic/home"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: "10px 20px",
                                borderRadius: "6px",
                                border: "1px solid #1976d2",
                                textDecoration: "none",
                                fontWeight: 500,
                                display: "inline-block",
                            }}
                        >
                            Буцах
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
