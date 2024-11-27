/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        minimumCacheTTL: 60,
        domains: [
            "images.unsplash.com",
            "xaa2.app.nso.mn",
            "medee.app.nso.mn",
            "os.alipayobjects.com",
            "api.ipify.org",
            "downloads.1212.mn",
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'downloads.1212.mn',
                pathname: '/**', // Allow all paths under this domain
            },
        ],
    },
    env: {
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        FRONTEND: process.env.FRONTEND,
        BACKEND_URL: process.env.BACKEND_URL,
        BACKEND_KEY: process.env.BACKEND_KEY,
        GOOGLE_SERVICE_ACCOUNT: process.env.GOOGLE_SERVICE_ACCOUNT,
        GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
        ELASTIC_SEARCH: process.env.ELASTIC_SEARCH,
        API_URL: process.env.API_URL,
    },
    output: "standalone",
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
