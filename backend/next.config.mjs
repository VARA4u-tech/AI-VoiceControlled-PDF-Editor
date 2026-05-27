/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pure API, no need for React strict mode overhead or image optimization
  reactStrictMode: false,
  // Ensure we can handle large PDF uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
};

export default nextConfig;
