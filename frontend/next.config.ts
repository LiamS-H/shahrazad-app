import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // turbopack: {
    //     rules: {
    //         "*.wasm": {
    //             loaders: ["webassembly-loader"],
    //             as: "*.wasm",
    //         },
    //     },
    // },
    // webpack: (config) => {
    //     config.experiments = { ...config.experiments, asyncWebAssembly: true };
    //     return config;
    // },
};

export default nextConfig;
