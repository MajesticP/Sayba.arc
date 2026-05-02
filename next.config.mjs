/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript errors must be fixed — never suppress them in production builds
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Force HTTPS for 1 year (enable only once you're fully on HTTPS)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Limit referrer info sent to third parties
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable browser features not needed by this app
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Content-Security-Policy is set dynamically per-request in middleware.ts
          // It uses a per-request nonce (eliminating unsafe-inline/unsafe-eval for scripts)
          // and reads NEXT_PUBLIC_SUPABASE_URL from env so the project ref isn't hardcoded here.
        ],
      },
      // Stricter headers for the admin section
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
}

export default nextConfig
