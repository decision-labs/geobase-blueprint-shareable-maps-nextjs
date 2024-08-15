/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	publicRuntimeConfig: {
		GEOBASE_URL: process.env.NEXT_PUBLIC_GEOBASE_URL,
		GEOBASE_ANON_KEY: process.env.NEXT_PUBLIC_GEOBASE_ANON_KEY,
	},
};

export default nextConfig;
