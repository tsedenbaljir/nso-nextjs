import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
    getTableauConnectedAppConfig,
    getTableauEmbedUsername,
} from "@/lib/tableau/config";

function readEnv(name) {
    const value = process.env[name];
    return typeof value === "string" ? value.trim() : "";
}

export function isTableauConnectedAppConfigured() {
    const { clientId, secretId, secretValue } = getTableauConnectedAppConfig();
    return Boolean(clientId && secretId && secretValue);
}

export function createTableauEmbedToken(username) {
    const { clientId, secretId, secretValue } = getTableauConnectedAppConfig();
    const user = getTableauEmbedUsername(username);

    if (!clientId || !secretId || !secretValue) {
        throw new Error("Tableau Connected App is not configured");
    }

    const configuredMinutes = Number.parseInt(
        readEnv("TABLEAU_JWT_EXPIRY_MINUTES") || "5",
        10
    );
    const expiryMinutes = Number.isFinite(configuredMinutes)
        ? Math.min(Math.max(configuredMinutes, 1), 9)
        : 5;
    const now = Math.floor(Date.now() / 1000);
    const exp = now + expiryMinutes * 60;

    return jwt.sign(
        {
            iss: clientId,
            sub: user,
            aud: "tableau",
            exp,
            jti: uuidv4(),
            scp: ["tableau:views:embed"],
        },
        secretValue,
        {
            algorithm: "HS256",
            header: {
                alg: "HS256",
                typ: "JWT",
                kid: secretId,
                iss: clientId,
            },
        }
    );
}

export { getTableauConnectedAppConfig, getTableauEnvironment } from "@/lib/tableau/config";
