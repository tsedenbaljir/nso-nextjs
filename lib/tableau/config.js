import { headers } from "next/headers";

function readEnv(name) {
    const value = process.env[name];
    return typeof value === "string" ? value.trim() : "";
}

function normalizeHost(host) {
    if (!host) return "";
    return host.split(",")[0].split(":")[0].trim().toLowerCase();
}

const HOST_APP_MAP = {
    localhost: { prefix: "TABLEAU_LOCAL_", appName: "NSO-LOCAL-DirectTrust" },
    "127.0.0.1": { prefix: "TABLEAU_LOCAL_", appName: "NSO-LOCAL-DirectTrust" },
    "1212.mn": { prefix: "TABLEAU_PROD_1212_", appName: "NSO-1212-DirectTrust" },
    "www.1212.mn": { prefix: "TABLEAU_PROD_WWW1212_", appName: "NSO-www1212-DirectTrust" },
    "data.nso.mn": { prefix: "TABLEAU_PROD_NSO_", appName: "NSO-NSO-DirectTrust" },
    "nso.mn": { prefix: "TABLEAU_PROD_NSO_", appName: "NSO-NSO-DirectTrust" },
    "www.nso.mn": { prefix: "TABLEAU_PROD_WWWNSO_", appName: "NSO-wwwNSO-DirectTrust" },
};

export function getTableauEnvironment() {
    const explicit = readEnv("TABLEAU_ENV").toLowerCase();
    if (explicit === "local" || explicit === "development") return "local";
    if (explicit === "production" || explicit === "prod") return "production";

    return process.env.NODE_ENV === "production" ? "production" : "local";
}

function resolveConfig(prefix, defaultAppName, environment, host = "") {
    return {
        environment,
        host,
        envPrefix: prefix,
        clientId:
            readEnv(`${prefix}CLIENT_ID`) || readEnv("TABLEAU_CONNECTED_APP_CLIENT_ID"),
        secretId:
            readEnv(`${prefix}SECRET_ID`) || readEnv("TABLEAU_CONNECTED_APP_SECRET_ID"),
        secretValue:
            readEnv(`${prefix}SECRET_VALUE`) ||
            readEnv("TABLEAU_CONNECTED_APP_SECRET_VALUE"),
        appName: readEnv(`${prefix}APP_NAME`) || defaultAppName,
    };
}

export async function getTableauConnectedAppConfig(hostHeader) {
    const forcedHost = readEnv("TABLEAU_FORCE_HOST");
    let host = forcedHost || hostHeader || "";

    if (!host) {
        try {
            const requestHeaders = await headers();
            host =
                requestHeaders.get("x-forwarded-host") ||
                requestHeaders.get("host") ||
                "";
        } catch {
            host = "";
        }
    }

    const normalizedHost = normalizeHost(host);
    const environment = getTableauEnvironment();
    const mapping = HOST_APP_MAP[normalizedHost];

    if (mapping) {
        return resolveConfig(
            mapping.prefix,
            mapping.appName,
            mapping.prefix === "TABLEAU_LOCAL_" ? "local" : "production",
            normalizedHost
        );
    }

    if (environment === "production") {
        return resolveConfig(
            "TABLEAU_PROD_WWW1212_",
            "NSO-www1212-DirectTrust",
            "production",
            normalizedHost
        );
    }

    return resolveConfig("TABLEAU_LOCAL_", "NSO-LOCAL-DirectTrust", "local", normalizedHost);
}

export function getTableauEmbedUsername(username) {
    return (
        username ||
        readEnv("TABLEAU_USERNAME") ||
        readEnv("TABLEAU_EMBED_USERNAME") ||
        "ViewerUser"
    );
}
