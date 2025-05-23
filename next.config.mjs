/** @type {import('next').NextConfig} */

const nextConfig = {
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push('oracledb');
            config.externals.push('canvas');
        }
        return config;
    },
    images: {
        minimumCacheTTL: 60,
        domains: [
            "images.unsplash.com",
            "os.alipayobjects.com",
            "api.ipify.org",
            "downloads.1212.mn",
            "betanso.nso.mn",
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'downloads.1212.mn',
                pathname: '/**', // Allow all paths under this domain
            },
            {
                protocol: 'https',
                hostname: 'betanso.nso.mn', // Add this
                pathname: '/images/**', // Restrict to images directory if needed
            },
        ],
    },
    env: {
        BASE_URL: process.env.BASE_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        FRONTEND: process.env.FRONTEND,
        BACKEND_URL: process.env.BACKEND_URL,
        BASE_FRONT_URL: process.env.BASE_FRONT_URL,
        BACKEND_KEY: process.env.BACKEND_KEY,
        GOOGLE_SERVICE_ACCOUNT: process.env.GOOGLE_SERVICE_ACCOUNT,
        GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
        ELASTIC_SEARCH: process.env.ELASTIC_SEARCH,
        API_URL: process.env.API_URL,
        BASE_API_URL: process.env.BASE_API_URL,
        X_API_KEY: process.env.X_API_KEY,
        INFO_EMAIL_1212: process.env.INFO_EMAIL_1212,
        INFO_PASSWORD_1212: process.env.INFO_PASSWORD_1212,
    },
    output: "standalone",
    crossOrigin: "anonymous",
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value:
                            "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
                    },
                ],
            },  
        ];
    },
};

export default nextConfig;
