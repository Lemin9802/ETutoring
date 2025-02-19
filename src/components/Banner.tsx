import React from "react";

interface BannerProps {
  title: string;
  description: string;
  bgColor?: string; // Optional background color
}

const Banner: React.FC<BannerProps> = ({ title, description, bgColor }) => {
  return (
    <div
      className={`w-full py-6 px-4 text-white text-center rounded-lg shadow-lg ${
        bgColor || "bg-blue-600"
      }`}
    >
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-lg">{description}</p>
    </div>
  );
};

export default Banner;
