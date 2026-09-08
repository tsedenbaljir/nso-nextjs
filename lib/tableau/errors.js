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

    let rawMessage =
        detail?.message ||
        (typeof detail?.errorMessage === "string" ? detail.errorMessage : null) ||
        null;

    if (typeof detail?.errorMessage === "string") {
        try {
            const parsed = JSON.parse(detail.errorMessage);
            code = parsed?.result?.errors?.[0]?.code ?? code;
            rawMessage =
                parsed?.result?.errors?.[0]?.detail ||
                parsed?.errorResponseType ||
                rawMessage;
        } catch {
            // ignore malformed payload
        }
    }

    // Tableau Generic payload: {"errorResponseType":"Generic","errorExtras":"..."}
    if (!code && typeof rawMessage === "string" && rawMessage.includes("errorResponseType")) {
        try {
            const parsed = JSON.parse(rawMessage);
            if (parsed?.errorResponseType === "Generic") {
                return {
                    code: null,
                    message:
                        "Tableau view ачаалахад алдаа гарлаа. View path буруу, эсвэл ViewerUser эрхгүй байж болно. Хуудсыг дахин ачаална уу.",
                };
            }
        } catch {
            // fall through
        }
    }

    const mapped = code ? getTableauErrorMessage(code) : null;
    const fallback = rawMessage || "Tableau дашбоард ачаалахад алдаа гарлаа";
    let message = mapped || fallback;

    if (code === 10092 && typeof window !== "undefined") {
        message += ` Одоогийн домэйн: ${window.location.origin}. Tableau админ дээр Connected App → Domain allowlist руу нэмнэ үү.`;
    }

    return {
        code,
        message: code ? `${message} (код: ${code})` : message,
    };
}
