/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir: true,
  },
  images: {
    domains: ["firebasestorage.googleapis.com", 'lh3.googleusercontent.com'],
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '**',
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Fix for pdfjs-dist and canvas in Next.js
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        fs: false,
        path: false,
      };
    }

    // Handle pdfjs-dist worker files
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.mjs',
    };

    return config;
  },
};

module.exports = nextConfig;

// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
