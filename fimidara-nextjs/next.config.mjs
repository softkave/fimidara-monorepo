import bundleAnalyzer from "@next/bundle-analyzer";
import mdxNext from "@next/mdx";
import withPlugins from "next-compose-plugins";

const withMDX = mdxNext();

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

/** @type {import('next').NextConfig} */
const baseNextConfig = {
  reactStrictMode: true,
  pageExtensions: ["md", "mdx", "mdoc", "js", "jsx", "ts", "tsx"],
  redirects() {
    return [
      {
        source: "/docs",
        destination: "/docs/fimidara/introduction",
        permanent: false,
      },
      {
        source: "/docs/fimidara",
        destination: "/docs/fimidara/introduction",
        permanent: false,
      },
      {
        source: "/docs/fimidara-rest-api",
        destination: "/docs/fimidara-rest-api/v1/overview",
        permanent: false,
      },
      {
        source: "/docs/fimidara-rest-api/v1",
        destination: "/docs/fimidara-rest-api/v1/overview",
        permanent: false,
      },
      {
        source: "/docs/fimidara-js-sdk",
        destination: "/docs/fimidara-js-sdk/v1/overview",
        permanent: false,
      },
      {
        source: "/docs/fimidara-js-sdk/v1",
        destination: "/docs/fimidara-js-sdk/v1/overview",
        permanent: false,
      },
    ];
  },
  transpilePackages: [
    "@ant-design/icons",
    "@ant-design/icons-svg",
    "rc-upload",
    "geist",
  ],
  productionBrowserSourceMaps: true,
  webpack: (config, { isServer, dev }) => {
    // Only generate source maps for production builds
    if (isServer && !dev) {
      config.devtool = "source-map";
    }
    return config;
  },
};

const nextConfig = withPlugins(
  [
    [withMDX],
    // [withBundleAnalyzer],
    /* ...other plugins... */
  ],
  baseNextConfig
);

export default nextConfig;
