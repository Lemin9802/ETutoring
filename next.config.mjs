/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "antd",
    "@ant-design/icons",
    "@ant-design/icons-svg",
    "rc-util",
    "rc-pagination",
    "rc-picker",
    "rc-dialog",
    "rc-input",
    "rc-field-form",
    "rc-select",
    "rc-upload",
    "rc-dropdown",
  ],
};

export default nextConfig;
