import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    redirects: async () => [
        {
            source: "/game/",
            destination: "/game/create",
            permanent: false,
        },
    ],
};

export default nextConfig;
