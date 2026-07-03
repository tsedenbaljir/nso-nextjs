import {
    createTableauEmbedToken,
    getTableauConnectedAppConfig,
    isTableauConnectedAppConfigured,
} from "@/lib/tableau/connectedApp";
import { getTableauServerUrl } from "@/lib/tableau/viewUrl";

export function getTableauEmbedAuthPayload(username) {
    if (!isTableauConnectedAppConfigured()) {
        throw new Error(
            "Tableau Connected App тохиргоо дутуу байна (CLIENT_ID, SECRET_ID, SECRET_VALUE)."
        );
    }

    const token = createTableauEmbedToken(username);
    const { environment, appName } = getTableauConnectedAppConfig();

    return {
        token,
        serverUrl: getTableauServerUrl(),
        environment,
        appName,
    };
}
