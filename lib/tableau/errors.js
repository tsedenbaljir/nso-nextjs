const TABLEAU_ERROR_MESSAGES = {
    10092: "Энэ домэйн Connected App-ийн domain allowlist-д бүртгэгдээгүй байна.",
    10096: "JWT token-ийн хугацаа хэтэрсэн эсвэл зөвшөөрөгдсөн хугацаанаас урт байна.",
    10094: "JWT-д jti (JWT ID) дутуу байна.",
    10089: "Connected App олдсонгүй — Client ID буруу байж магадгүй.",
    10083: "JWT header буруу байна (kid эсвэл iss дутуу).",
    127: "Connected App secret олдсонгүй — Secret ID/Value шалгана уу.",
    126: "Connected App идэвхгүй эсвэл олдсонгүй.",
};

export function getTableauErrorMessage(code) {
    return TABLEAU_ERROR_MESSAGES[code] || null;
}

export function parseTableauEmbedError(detail = {}) {
    let code =
        detail?.errorCode ??
        detail?.code ??
        detail?.statusCode ??
        null;

    if (!code && typeof detail?.errorMessage === "string") {
        try {
            const parsed = JSON.parse(detail.errorMessage);
            code = parsed?.result?.errors?.[0]?.code ?? null;
        } catch {
            // ignore malformed payload
        }
    }

    const mapped = code ? getTableauErrorMessage(code) : null;
    const fallback =
        detail?.message ||
        (typeof detail?.errorMessage === "string" ? detail.errorMessage : null) ||
        "Tableau дашбоард ачаалахад алдаа гарлаа";

    let message = mapped || fallback;

    if (code === 10092 && typeof window !== "undefined") {
        message += ` Одоогийн домэйн: ${window.location.origin}. Tableau админ дээр NSO-1212-DirectTrust → Domain allowlist руу нэмнэ үү.`;
    }

    return {
        code,
        message: code ? `${message} (код: ${code})` : message,
    };
}
