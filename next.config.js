// next.config.mjs
import './src/env.js'; // Keep this line as is
import withPWA from 'next-pwa'; // Use ES module import

/** @type {import("next").NextConfig} */
const config = {
  // Your existing Next.js configurations go here.
};

// Configure the next-pwa plugin
const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // Add more advanced caching strategies here later if needed
  // runtimeCaching: [],
  // fallbacks: {},
});

// Export the wrapped configuration
export default pwaConfig(config);