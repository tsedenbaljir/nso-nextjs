function readEnv(name) {
    const value = process.env[name];
    return typeof value === "string" ? value.trim() : "";
}

export function getTableauEnvironment() {
    const explicit = readEnv("TABLEAU_ENV").toLowerCase();
    if (explicit === "local" || explicit === "development") return "local";
    if (explicit === "production" || explicit === "prod") return "production";

    return process.env.NODE_ENV === "production" ? "production" : "local";
}

export function getTableauConnectedAppConfig() {
    const environment = getTableauEnvironment();
    const prefix = environment === "production" ? "TABLEAU_PROD_" : "TABLEAU_LOCAL_";

    const clientId =
        readEnv(`${prefix}CLIENT_ID`) || readEnv("TABLEAU_CONNECTED_APP_CLIENT_ID");
    const secretId =
        readEnv(`${prefix}SECRET_ID`) || readEnv("TABLEAU_CONNECTED_APP_SECRET_ID");
    const secretValue =
        readEnv(`${prefix}SECRET_VALUE`) || readEnv("TABLEAU_CONNECTED_APP_SECRET_VALUE");

    return {
        environment,
        clientId,
        secretId,
        secretValue,
        appName:
            environment === "production"
                ? readEnv("TABLEAU_PROD_APP_NAME") || "NSO-1212-DirectTrust"
                : readEnv("TABLEAU_LOCAL_APP_NAME") || "NSO-LOCAL-DirectTrust",
    };
}

export function getTableauEmbedUsername(username) {
    return (
        username ||
        readEnv("TABLEAU_USERNAME") ||
        readEnv("TABLEAU_EMBED_USERNAME") ||
        "ViewerUser"
    );
}
