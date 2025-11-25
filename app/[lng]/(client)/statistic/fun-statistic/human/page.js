"use client";

import { useState, useEffect } from "react";
import { fetchHomoHuman } from "@/app/services/actions";

export default function HumanPage() {
    const [letter1, setLetter1] = useState("");
    const [letter2, setLetter2] = useState("");
    const [digits, setDigits] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [result, setResult] = useState(null);
    const [mergedImageUrl, setMergedImageUrl] = useState(null);
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [activeLetterField, setActiveLetterField] = useState(null);

    const cyrillicLetters = [
        ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё'],
        ['Ж', 'З', 'И', 'Й', 'К', 'Л', 'М'],
        ['Н', 'О', 'Ө', 'П', 'Р', 'С', 'Т'],
        ['У', 'Ү', 'Ф', 'Х', 'Ц', 'Ч', 'Ш'],
        ['Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я']
    ];

    const handleNewSearch = () => {
        setResult(null);
        setMergedImageUrl(null);
        setStatus(null);
        setLetter1("");
        setLetter2("");
        setDigits("");
        setTimeout(() => {
            document.getElementById('letter1-input')?.focus();
        }, 100);
    };

    const openKeyboard = (field) => {
        setActiveLetterField(field);
        setShowKeyboard(true);
    };

    const selectLetter = (letter) => {
        if (activeLetterField === 1) {
            setLetter1(letter);
            setShowKeyboard(false);
            setActiveLetterField(null);
            setTimeout(() => {
                document.getElementById('letter2-input')?.focus();
            }, 100);
        } else if (activeLetterField === 2) {
            setLetter2(letter);
            setShowKeyboard(false);
            setActiveLetterField(null);
            setTimeout(() => {
                document.getElementById('digits-input')?.focus();
            }, 100);
        }
    };

    const clearKeyboard = () => {
        if (activeLetterField === 1) {
            setLetter1("");
        } else if (activeLetterField === 2) {
            setLetter2("");
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus(null);
        setResult(null);
        setMergedImageUrl(null);

        // Validate each part
        if (!letter1 || !letter2) {
            setStatus("Регистрийн үсгүүдийг оруулна уу.");
            return;
        }

        if (digits.length !== 8) {
            setStatus("Регистрийн дугаар 8 оронтой байх ёстой.");
            return;
        }

        // Validate Cyrillic letters
        const cyrillicPattern = /^[А-ЯЁӨҮа-яёөү]$/;
        if (!cyrillicPattern.test(letter1) || !cyrillicPattern.test(letter2)) {
            setStatus("Зөвхөн Монгол кирилл үсэг ашиглана уу.");
            return;
        }

        // Combine the parts
        const registerNo = `${letter1}${letter2}${digits}`;

        setLoading(true);
        const result = await fetchHomoHuman(registerNo.trim());
        if (result.success) {
            setResult(result.data);
        } else {
            setStatus(result.error || "Та регистрийн дугаараа зөв оруулна уу.");
        }
        setLoading(false);
    }

    const handleDigitsChange = (e) => {
        const value = e.target.value;
        if (/^\d{0,8}$/.test(value)) {
            setDigits(value);
        }
    };

    const handleKeyDown = (e, field) => {
        if (e.key === 'Backspace') {
            if (field === 'digits' && !digits) {
                e.preventDefault();
                document.getElementById('letter2-input')?.click();
            }
        }
    };

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

    return (
        <div className="nso_container">
            <div className="w-full">
                <br />
                <h1 className="text-2xl font-bold mb-4">
                    Та Монгол Улсын хэд дэх иргэн бэ?
                </h1>

                {!result && <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-12">
                    <div className="mb-5">
                        <label className="block text-gray-800 text-sm font-medium mb-3">
                            Регистрийн дугаар
                        </label>
                        <div className="flex gap-2 items-center">
                            <input
                                id="letter1-input"
                                type="text"
                                value={letter1}
                                onClick={() => openKeyboard(1)}
                                placeholder="Т"
                                maxLength={1}
                                readOnly
                                className="w-16 h-12 px-3 text-center text-lg font-medium border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors uppercase bg-white cursor-pointer"
                            />
                            <input
                                id="letter2-input"
                                type="text"
                                value={letter2}
                                onClick={() => openKeyboard(2)}
                                placeholder="А"
                                maxLength={1}
                                readOnly
                                className="w-16 h-12 px-3 text-center text-lg font-medium border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors uppercase bg-white cursor-pointer"
                            />
                            <input
                                id="digits-input"
                                type="text"
                                inputMode="numeric"
                                value={digits}
                                onChange={handleDigitsChange}
                                onKeyDown={(e) => handleKeyDown(e, 'digits')}
                                placeholder="97112114"
                                maxLength={8}
                                className="flex-1 h-12 px-4 text-lg font-medium border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-500 transition-colors bg-gray-50"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? "Тооцож байна..." : "Хайх"}
                    </button>

                    {status && (
                        <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-line">
                            {status}
                        </div>
                    )}

                    {/* Cyrillic Keyboard Modal */}
                    {showKeyboard && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowKeyboard(false)}>
                            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                <h3 className="text-center text-blue-600 font-semibold text-lg mb-4">
                                    РД {activeLetterField === 1 ? 'эхний' : 'хоёр дахь'} үсгээ сонгоно уу
                                </h3>
                                
                                <div className="space-y-2 mb-4">
                                    {cyrillicLetters.map((row, rowIndex) => (
                                        <div key={rowIndex} className="flex justify-center gap-2">
                                            {row.map((letter) => (
                                                <button
                                                    key={letter}
                                                    type="button"
                                                    onClick={() => selectLetter(letter)}
                                                    className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg text-lg font-medium hover:bg-blue-50 hover:border-blue-400 transition-colors"
                                                >
                                                    {letter}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={clearKeyboard}
                                    className="w-full py-3 border-2 border-red-400 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors"
                                >
                                    Арилгах
                                </button>
                            </div>
                        </div>
                    )}
                </form>}

                {result && (
                    <>
                        <div className="flex justify-center mb-6">
                            <button
                                onClick={handleNewSearch}
                                className="py-2 px-6 bg-white border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-900 hover:text-white transition-colors"
                            >
                                Дахин хайх
                            </button>
                        </div>

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
                            className="flex flex-row justify-end items-center gap-2 mt-4 mb-2"
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

                            {result.image1Url && (
                                <a
                                    href={mergedImageUrl}
                                    download="sonirkholtoi-image.png"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white font-medium text-sm no-underline"
                                >
                                    Зураг татах
                                </a>
                            )}
                        </div>


                        {result.image1Url && result.image2Url && (
                            <section className="mb-6">
                                <div
                                    className="flex flex-row gap-1"
                                >
                                    <img
                                        src={result.image1Url}
                                        alt="Төрсний гэрчилгээ"
                                        className="w-1/2 h-auto block object-contain"
                                    />
                                    <img
                                        src={result.image2Url}
                                        alt="Статистикийн зураг"
                                        className="w-1/2 h-auto block object-contain"
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
            </div>
        </div>
    );
}