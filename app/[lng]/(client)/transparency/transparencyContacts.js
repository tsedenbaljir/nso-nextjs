export const TRANSPARENCY_CONTACT_BY_ID = {
    54: "contactSource",
    59: "munkhOchSource",
    68: "gotsbayarSource",
};

export function getTransparencyIdFromPath(pathname) {
    if (!pathname) return null;
    const match = pathname.match(/\/transparency\/[^/]+\/(\d+)\/?$/);
    return match?.[1] ?? null;
}

export function getTransparencySourceKey(id) {
    if (!id) return "transparencySource";
    return TRANSPARENCY_CONTACT_BY_ID[String(id)] ?? "transparencySource";
}
