/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // rewrites: async () => {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'https://abp.antosubash.com/api/:path*',
  //     },
  //   ]
  // },
}

export default nextConfig
