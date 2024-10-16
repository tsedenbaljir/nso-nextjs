/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: {
        appDir: true,
    },
    images: {
        minimumCacheTTL: 60,
        domains: [
            "images.unsplash.com",
            "xaa2.app.nso.mn",
            "medee.app.nso.mn",
            "os.alipayobjects.com",
            "api.ipify.org",
        ],
    },
    secret: "@dmindata",
    env: {
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        FRONTEND: process.env.FRONTEND,
        BACKEND_URL: process.env.BACKEND_URL,
        BACKEND_KEY: process.env.BACKEND_KEY,
    },
    output: "standalone",
    api: {
        responseLimit: "8mb",
    },
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
