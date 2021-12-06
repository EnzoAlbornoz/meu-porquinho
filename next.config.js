/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    webpack: (config) => {
        // Add SVGR
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"],
        });
        // Return Built Config
        return config;
    },
};
