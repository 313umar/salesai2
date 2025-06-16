const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Skip all lint errors
  },
  typescript: {
    ignoreBuildErrors: true,  // ✅ Skip TypeScript errors like 'any'
  },
};

export default nextConfig;
