/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack filesystem cache in development to prevent chunk mismatch errors on Windows
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
