import {
    createTableauEmbedToken,
    getTableauConnectedAppConfig,
    isTableauConnectedAppConfigured,
} from "@/lib/tableau/connectedApp";
import { getTableauServerUrl } from "@/lib/tableau/viewUrl";

export async function getTableauEmbedAuthPayload(username, hostHeader) {
    if (!(await isTableauConnectedAppConfigured(hostHeader))) {
        throw new Error(
            "Tableau Connected App тохиргоо дутуу байна (CLIENT_ID, SECRET_ID, SECRET_VALUE)."
        );
    }

    const token = await createTableauEmbedToken(username, hostHeader);
    const config = await getTableauConnectedAppConfig(hostHeader);

    return {
        token,
        serverUrl: getTableauServerUrl(),
        environment: config.environment,
        appName: config.appName,
        host: config.host,
        envPrefix: config.envPrefix,
    };
}
