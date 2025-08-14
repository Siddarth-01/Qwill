import React from "react";

interface TwillLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const TwillLogo: React.FC<TwillLogoProps> = ({
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5 md:w-6 md:h-6",
    lg: "w-6 h-6 md:w-8 md:h-8",
  };

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses[size]} ${className}`}
    >
      <defs>
        <linearGradient
          id="quillHeaderGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#f8fafc", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
      <g>
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          fill="url(#quillHeaderGradient)"
          d="M21 2C6 2 4 16 3 22h1.998c.666-3.333 2.333-5.166 5.002-5.5 4-.5 7-4 8-7l-1.5-1 1-1c1-1 2.004-2.5 3.5-5.5z"
        />
      </g>
    </svg>
  );
};

export default TwillLogo;
