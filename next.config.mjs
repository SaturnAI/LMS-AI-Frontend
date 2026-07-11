/** @type {import('next').NextConfig} */

// When API_PROXY_TARGET is set, the dev server proxies same-origin `/api/*`
// requests to the real backend. This makes the auth_token cookie first-party
// (localhost:3000), so the backend's SameSite=lax cookie is sent on XHR —
// no backend change or deployment required. Leave it unset to call the API
// directly (e.g. a same-origin production deploy).
const API_PROXY_TARGET = process.env.API_PROXY_TARGET;

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!API_PROXY_TARGET) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
