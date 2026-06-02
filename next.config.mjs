/** @type {import('next').NextConfig} */

const nextConfig = {
    serverExternalPackages: ["knex", "mssql", "tedious", "oracledb", "canvas"],
    experimental: {
        serverActions: {
            bodySizeLimit: "100mb",
        },
    },
    turbopack: {},
    sassOptions: {
        silenceDeprecations: ["import", "mixed-decls"],
    },
    webpack: (config, { isServer }) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            "better-sqlite3": false,
            sqlite3: false,
            "pg-native": false,
            ...(isServer ? {} : { canvas: false, knex: false }),
        };

        if (isServer) {
            config.externals.push("oracledb", "canvas", "knex", "mssql", "tedious");
        }

        return config;
    },
    images: {
        minimumCacheTTL: 60,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "os.alipayobjects.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "api.ipify.org",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "downloads.1212.mn",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "www.nso.mn",
                pathname: "/**",
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
    crossOrigin: "anonymous",
    async redirects() {
        return [
            {
                source: "/:lng/statistic/socio-economic-dashboard/:id",
                destination: "/:lng/statistics-dashboard/:id",
                permanent: true,
            },
            {
                source: "/:lng/statistic/socio-economic-dashboard",
                destination: "/:lng/statistics-dashboard",
                permanent: true,
            },
            {
                source: "/:lng/statistics-dashboard/business-register",
                destination: "/:lng/statistics-dashboard/business",
                permanent: true,
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: "/:lng/statistics-dashboard",
                destination: "/:lng/s-e-dashboard",
            },
            {
                source: "/:lng/statistics-dashboard/:id",
                destination: "/:lng/s-e-dashboard/:id",
            },
        ];
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
