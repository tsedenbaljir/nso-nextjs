"use client";

import { useState, useEffect } from "react";
import { fetchHomoHuman } from "@/app/services/actions";

export default function HumanPage() {
    const [registerNo, setRegisterNo] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [result, setResult] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus(null);
        setResult(null);
        setMergedImageUrl(null);

        if (!registerNo.trim()) {
            setStatus("Та регистрийн дугаараа оруулна уу.");
            return;
        }

        setLoading(true);
        const result = await fetchHomoHuman(registerNo.trim());
        if (result.success) {
            setResult(result.data);
        } else {
            setStatus(result.error || "Та регистрийн дугаараа зөв оруулна уу.");
        }
        setLoading(false);
    }

    useEffect(() => {
        async function mergeImages() {
            if (!result?.image1Url || !result?.image2Url) {
                return;
            }

            try {
                const img1 = new Image();
                const img2 = new Image();
                img1.crossOrigin = "anonymous";
                img2.crossOrigin = "anonymous";

                await Promise.all([
                    new Promise((resolve, reject) => {
                        img1.onload = resolve;
                        img1.onerror = reject;
                        img1.src = result.image1Url;
                    }),
                    new Promise((resolve, reject) => {
                        img2.onload = resolve;
                        img2.onerror = reject;
                        img2.src = result.image2Url;
                    }),
                ]);

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // Flex-like merge: keep equal height, place images side-by-side
                const targetHeight = Math.max(img1.height, img2.height);
                const scale1 = targetHeight / img1.height;
                const scale2 = targetHeight / img2.height;
                const width1 = img1.width * scale1;
                const width2 = img2.width * scale2;

                canvas.width = width1 + width2;
                canvas.height = targetHeight;

                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw first image on the left
                ctx.drawImage(img1, 0, 0, width1, targetHeight);

                // Draw second image on the right
                ctx.drawImage(img2, width1, 0, width2, targetHeight);

                // Convert canvas to data URL
                const mergedUrl = canvas.toDataURL("image/png");
                setMergedImageUrl(mergedUrl);
            } catch (error) {
                console.error("Error merging images:", error);
            }
        }

        mergeImages();
    }, [result?.image1Url, result?.image2Url]);

    const model = result?.model || null;

    return (
        <main
            style={{
                maxWidth: 900,
                margin: "0 auto",
                padding: "2rem 1rem",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI'",
            }}
        >
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
                Хүн амын сонирхолтой статистик
            </h1>

            {!result && <form
                onSubmit={handleSubmit}
                style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 24,
                    background: "#fafafa",
                }}
            >
                <div style={{ marginBottom: 12 }}>
                    <label
                        style={{
                            display: "block",
                            fontSize: 14,
                            fontWeight: 600,
                            marginBottom: 4,
                        }}
                    >
                        Регистрийн дугаар
                    </label>
                    <input
                        type="text"
                        value={registerNo}
                        onChange={(e) => setRegisterNo(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 4,
                            border: "1px solid #d1d5db",
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "8px 16px",
                        borderRadius: 4,
                        border: "none",
                        background: loading ? "#60a5fa" : "#2563eb",
                        color: "white",
                        fontWeight: 600,
                        cursor: loading ? "default" : "pointer",
                    }}
                >
                    {loading ? "Тооцож байна..." : "Хайх"}
                </button>

                {status && (
                    <p
                        style={{
                            marginTop: 10,
                            color: "#1877F2",
                            fontSize: 13,
                            whiteSpace: "pre-line",
                        }}
                    >
                        {status}
                    </p>
                )}
            </form>}

            {result && result.ok && (
                <>

                    {/* Тайлбар (SetDescription1-тэй ижил агуулга) */}
                    {/* <section style={{ marginBottom: 24 }}>
                        <div
                            style={{
                                background: "#f9fafb",
                                borderRadius: 8,
                                padding: 16,
                                fontSize: 14,
                                lineHeight: 1.6,
                            }}
                            dangerouslySetInnerHTML={{ __html: result.description }}
                        />
                    </section> */}

                    {/* <hr style={{ margin: "24px 0" }} /> */}

                    {/* Хоёр зураг зэрэгцээ ба татах товч */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: 8,
                            marginTop: 16,
                            marginBottom: 10,
                        }}
                    >
                        {/* Facebook share товч */}
                        {/* {result.shareUrl && (
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                    "https://www.1212.mn/mn/statistic/fun-statistic/human"
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "8px 16px",
                                    borderRadius: 4,
                                    background: "#1877F2",
                                    color: "white",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    textDecoration: "none",
                                }}
                            >
                                Facebook-д хуваалцах
                            </a>
                        )} */}

                        {mergedImageUrl && (
                            <a
                                href={mergedImageUrl}
                                download="sonirkholtoi-image.png"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "8px 16px",
                                    borderRadius: 4,
                                    background: "#1877F2",
                                    color: "white",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    textDecoration: "none",
                                }}
                            >
                                Зураг татах
                            </a>
                        )}
                    </div>


                    {result.image1Url && result.image2Url && (
                        <section style={{ marginBottom: 24 }}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: 1,
                                }}
                            >
                                <img
                                    src={result.image1Url}
                                    alt="Төрсний гэрчилгээ"
                                    style={{
                                        width: "50%",
                                        height: "auto",
                                        display: "block",
                                        objectFit: "contain",
                                    }}
                                />
                                <img
                                    src={result.image2Url}
                                    alt="Статистикийн зураг"
                                    style={{
                                        width: "50%",
                                        height: "auto",
                                        display: "block",
                                        objectFit: "contain",
                                    }}
                                />
                            </div>
                        </section>
                    )}

                    {/* Статистикийн тоонууд */}
                    {/* {model && (
                        <section style={{ marginBottom: 24 }}>
                            <h2
                                style={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                    marginBottom: 8,
                                }}
                            >
                                Товч статистик
                            </h2>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: 13,
                                }}
                            >
                                <tbody>
                                    <tr>
                                        <td style={tdLabelStyle}>Регистр</td>
                                        <td style={tdValueStyle}>{model.registerNo}</td>
                                    </tr>
                                    <tr>
                                        <td style={tdLabelStyle}>Овог</td>
                                        <td style={tdValueStyle}>{model.surename}</td>
                                    </tr>
                                    <tr>
                                        <td style={tdLabelStyle}>Нэр</td>
                                        <td style={tdValueStyle}>{model.name}</td>
                                    </tr>
                                    <tr>
                                        <td style={tdLabelStyle}>Нас</td>
                                        <td style={tdValueStyle}>{model.Age}</td>
                                    </tr>
                                    <tr>
                                        <td style={tdLabelStyle}>Тантай ижил нэртэй</td>
                                        <td style={tdValueStyle}>
                                            {model.countName.toLocaleString("mn-MN")} иргэн
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={tdLabelStyle}>Тантай ижил насны</td>
                                        <td style={tdValueStyle}>
                                            {model.countAge.toLocaleString("mn-MN")} иргэн
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={tdLabelStyle}>Үүнээс эрэгтэй</td>
                                        <td style={tdValueStyle}>
                                            {model.countAgeM.toLocaleString("mn-MN")} иргэн
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={tdLabelStyle}>Үүнээс эмэгтэй</td>
                                        <td style={tdValueStyle}>
                                            {model.countAgeF.toLocaleString("mn-MN")} иргэн
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={tdLabelStyle}>Ижил түвшний боловсролтой</td>
                                        <td style={tdValueStyle}>
                                            {model.countEducaton.toLocaleString("mn-MN")} иргэн
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={tdLabelStyle}>Хөдөлмөр эрхэлдэг</td>
                                        <td style={tdValueStyle}>
                                            {model.countEmployment.toLocaleString("mn-MN")} иргэн
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={tdLabelStyle}>Төрөхөд байсан хүн ам</td>
                                        <td style={tdValueStyle}>
                                            {model.countPop.toLocaleString("mn-MN")} хүн
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={tdLabelStyle}>Төрсөн он, сар, өдөр</td>
                                        <td style={tdValueStyle}>
                                            {model.year1}-{String(model.month1).padStart(2, "0")}-
                                            {String(model.day1).padStart(2, "0")}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>
                    )} */}
                </>
            )}
        </main>
    );
}

// жижиг inline style-ууд
const tdLabelStyle = {
    padding: "6px 8px",
    borderBottom: "1px solid #e5e7eb",
    background: "#f3f4f6",
    width: "40%",
    fontWeight: 600,
};

const tdValueStyle = {
    padding: "6px 8px",
    borderBottom: "1px solid #e5e7eb",
};
